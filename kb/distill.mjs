// Distiller — turns each private corpus doc into a compact, PUBLISHABLE sales-enablement
// fact sheet via Requesty (haiku). Output kb/kb-pack.json IS committed and shipped to the
// public Pages demo, so the contract is strict: describe what the course TEACHES (module
// scope, depth signals, buyer-relevant facts) — never verbatim passages, never clinical
// protocols/dosing, nothing a non-buyer could use as course content.
// Usage: REQUESTY_API_KEY=... node kb/distill.mjs [--only <docname>]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'corpus');
const OUT = join(HERE, 'kb-pack.json');
const rkeyEnv = process.env.REQUESTY_API_KEY || '';
if (!rkeyEnv) { console.error('Set REQUESTY_API_KEY'); process.exit(1); }
const MODEL = 'anthropic/claude-haiku-4-5';

const SYS = `You are building the knowledge pack for an AI program advisor that SELLS the Functional Medicine Certification (FMP-C, $3,999) to nurse practitioners. You are given raw extracted text from ONE course document.

Produce a compact fact sheet the advisor can use to prove the program's depth when buyers ask "does it cover X?" / "how deep does it go?".

STRICT RULES (the output ships on a public website):
- Describe what the course TEACHES and COVERS — topics, skills, frameworks, tools, business models taught. NEVER reproduce course content itself: no dosing, no protocols, no treatment steps, no verbatim passages.
- Buyer-relevant specifics are GOOD: named lab panels it teaches interpretation of, conditions addressed, practice/business models taught, case-study formats, who teaches it.
- 8-14 bullet facts, each one sentence, concrete.
- Also produce: a 1-sentence "pitch" (why this module matters to an NP buyer) and 3-6 lowercase "keywords" for retrieval.

OUTPUT ONLY JSON: {"title":"<human title>","pitch":"<1 sentence>","facts":["...", ...],"keywords":["...", ...]}`;

async function distill(name, text) {
  // sample start + middle + end so big decks are represented
  const cap = 15000;
  const sample = text.length <= cap ? text
    : text.slice(0, cap * 0.5) + '\n[...]\n' + text.slice(text.length / 2, text.length / 2 + cap * 0.25) + '\n[...]\n' + text.slice(-cap * 0.25);
  const res = await fetch('https://router.requesty.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + rkeyEnv, 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 900, messages: [{ role: 'system', content: SYS }, { role: 'user', content: `DOCUMENT: ${name}\n\n${sample}` }] })
  });
  const d = await res.json();
  if (!res.ok || d.error) throw new Error((d.error && d.error.message) || res.status);
  const c = d.choices[0].message.content.replace(/^```(json)?|```$/g, '').trim();
  const m = c.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? m[0] : c);
}

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const pack = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf-8')) : { built: null, cert: 'Functional Medicine Certification (FMP-C)', entries: [] };
const done = new Set(pack.entries.map(e => e.doc));

let ok = 0, fail = 0;
for (const f of readdirSync(SRC).filter(f => f.endsWith('.txt'))) {
  const name = basename(f, '.txt');
  if (only && name !== only) continue;
  if (!only && done.has(name)) { console.log('cached:', name); continue; }
  const text = readFileSync(join(SRC, f), 'utf-8').replace(/\s+/g, ' ').trim();
  if (text.length < 300) { console.log(`skip image-only: ${name}`); continue; }
  try {
    const e = await distill(name, text);
    pack.entries = pack.entries.filter(x => x.doc !== name);
    pack.entries.push({ doc: name, ...e });
    ok++; console.log(`ok (${ok}): ${name} — ${e.facts.length} facts`);
    writeFileSync(OUT, JSON.stringify(pack, null, 1)); // checkpoint each doc
  } catch (err) { fail++; console.error(`FAIL: ${name}: ${err.message}`); }
}
pack.built = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(pack, null, 1));
console.log(`\nPack: ${pack.entries.length} entries, ${ok} new, ${fail} failed → kb/kb-pack.json (${Math.round(JSON.stringify(pack).length / 1024)}KB)`);
