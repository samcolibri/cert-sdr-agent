// Live test harness — loads the REAL demo-brain.js (the exact file GitHub Pages serves)
// under stubbed browser globals, connects it to Requesty, and runs buyer scenarios.
// Usage: REQUESTY_API_KEY=... node tests/live_test.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rk = process.env.REQUESTY_API_KEY;
if (!rk) { console.error('Set REQUESTY_API_KEY'); process.exit(1); }

// ---- browser stubs ----
const ls = { advisor_rkey: rk };
global.localStorage = { getItem: k => ls[k], setItem: (k, v) => ls[k] = v, removeItem: k => delete ls[k] };
global.localStorage = new Proxy(ls, { get: (t, k) => typeof k === 'string' && k in t ? t[k] : ({ removeItem: k2 => delete t[k2] })[k], set: (t, k, v) => (t[k] = v, true), deleteProperty: (t, k) => (delete t[k], true) });
Object.defineProperty(global.localStorage, 'removeItem', { value: k => delete ls[k] });
global.sessionStorage = {};
global.location = { search: '', pathname: '/demo.html', reload: () => {} };
global.history = { replaceState: () => {} };
global.window = global;
const realFetch = global.fetch;
global.fetch = (url, opts) => {
  if (String(url) === 'kb/kb-pack.json') {
    const body = readFileSync(join(ROOT, 'kb', 'kb-pack.json'), 'utf-8');
    return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(body)) });
  }
  return realFetch(url, opts);
};

// ---- load the real shipped brain ----
const src = readFileSync(join(ROOT, 'demo-brain.js'), 'utf-8');
eval(src);
const B = global.AdvisorBrain;
await new Promise(r => setTimeout(r, 300)); // let the pack load
console.log('mode:', B.mode(), '|', B.modeLabel(), '\n');

const results = [];
async function turn(name, sid, payload, checks) {
  const t0 = Date.now();
  try {
    const out = await B.chat(sid, payload);
    const ms = Date.now() - t0;
    const failures = checks(out).filter(Boolean);
    results.push({ name, ms, pass: failures.length === 0, failures, reply: out.reply });
    console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} (${ms}ms) ${name}${failures.length ? ' — ' + failures.join('; ') : ''}`);
    console.log('   →', (out.reply || '').slice(0, 220).replace(/\n/g, ' '), '\n');
    return out;
  } catch (e) { results.push({ name, pass: false, failures: [e.message] }); console.log(`ERROR ${name}: ${e.message}\n`); return {}; }
}
const has = (r, re) => re.test(r.reply || '');

// T1 proactive greet + disclosure
await turn('T1 proactive greet (dwell) + AI disclosure', 's1', { trigger: 'dwell_scroll' }, o => [
  !/\bAI\b/i.test(o.reply) && 'no AI disclosure',
  /\$\s?3,?999/.test(o.reply) && 'mentioned price unprompted while rigor unresolved'
]);
// T2 RAG depth: thyroid labs
await turn('T2 RAG: thyroid labs beyond TSH', 's1', { message: 'Does it actually teach interpreting thyroid labs beyond TSH? Which markers?' }, o => [
  !has(o, /free T3|free T4|antibod/i) && 'missing thyroid-module specifics (free T3/T4/antibodies)'
]);
// T3 RAG business: cash-pay pricing
await turn('T3 RAG: cash-pay practice pricing', 's2', { message: 'Will this teach me how to actually price and run a cash-pay functional medicine practice?' }, o => [
  !has(o, /cash|pricing|business|membership|concierge|insurance/i) && 'missing business-module grounding'
]);
// T4 objection sequencing: depth question → no price
const t4 = await turn('T4 no price while rigor unresolved', 's3', { message: 'How deep does the gut health content actually go? Other programs were fluff.' }, o => [
  /\$\s?3,?999|\bcost\b|\bprice\b|affirm/i.test(o.reply) && 'raised price during rigor objection',
  !has(o, /gut|microbiome|GI/i) && 'missing gut-module grounding'
]);
// T5 direct price question → brief answer + pivot
await turn('T5 direct price question: 1 sentence then pivot', 's3', { message: 'ok but how much is it?' }, o => [
  !/\$\s?3,?999/.test(o.reply) && 'did not answer the direct price question',
  (o.reply.match(/\$/g) || []).length > 3 && 'price-dumped instead of brief answer'
]);
// T6 escalation: ask for a human
const t6 = await turn('T6 human expert assignment', 's4', { message: 'I would rather talk to a real person about whether this fits my practice. Can I talk to a human?' }, o => [
  o.escalate !== true && 'escalate flag not set',
  !has(o, /human|colleague|expert|person/i) && 'reply did not acknowledge the human handoff'
]);
// T7 unknown fact: state prescribing
await turn('T7 no-guess on state prescribing', 's5', { message: 'Will Tennessee let me prescribe HRT after this certification?' }, o => [
  has(o, /yes,? tennessee (will|lets|allows)/i) && 'GUESSED a state answer',
  !has(o, /human|colleague|expert|don'?t have|can'?t verify|not something/i) && 'did not defer/escalate'
]);
// T8 lead capture + buying signal
await turn('T8 lead capture', 's3', { message: 'fine, send me the outline: taylor.np@example.com' }, o => [
  !has(o, /outline|send|get (that|it) (to|over) you|on its way|today|shortly/i) && 'did not confirm outline send'
]);
// T9 recovery email (engaged, sonnet-5, RAG-grounded)
const t0 = Date.now();
try {
  const em = await B.abandon('s3', { name: 'Taylor', email: 'taylor.np@example.com' });
  const ms = Date.now() - t0;
  const fails = [
    em.mode !== 'engaged' && 'wrong mode',
    !/gut|depth|rigor|fluff|module/i.test(em.subject + em.body) && 'email not grounded in her conversation',
    !/AI/i.test(em.body) && 'no AI disclosure in email'
  ].filter(Boolean);
  results.push({ name: 'T9 engaged recovery email (sonnet-5)', ms, pass: !fails.length, failures: fails });
  console.log(`${fails.length ? 'FAIL' : 'PASS'} (${ms}ms) T9 engaged recovery email — SUBJECT: ${em.subject}`);
  console.log('   →', em.body.slice(0, 260).replace(/\n/g, ' '), '\n');
} catch (e) { results.push({ name: 'T9 email', pass: false, failures: [e.message] }); console.log('ERROR T9:', e.message); }

// summary
const stats = B.stats();
console.log('=== SUMMARY ===');
console.log(results.map(r => `${r.pass ? '✅' : '❌'} ${r.name}${r.ms ? ` (${(r.ms / 1000).toFixed(1)}s)` : ''}${r.failures && r.failures.length ? ' — ' + r.failures.join('; ') : ''}`).join('\n'));
console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed | kb: ${stats.kb_pack} | expert assignments: ${stats.expert_assignments} | emails: ${JSON.stringify(stats.emails)}`);
