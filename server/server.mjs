// Sandbox server — zero deps. Serves the demo page, widget, dashboard, and the advisor API.
// Run: node server/server.mjs   (ANTHROPIC_API_KEY env for live brain; omit for MOCK mode)
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chatTurn, writeRecoveryEmail, kbSummary, MOCK } from './advisor.mjs';
import { publicChat, publicEmail, publicApiReady } from './public_api.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || 4321;
const DATA = join(ROOT, 'data');
mkdirSync(DATA, { recursive: true });

const load = (f, d) => existsSync(join(DATA, f)) ? JSON.parse(readFileSync(join(DATA, f), 'utf-8')) : d;
const save = (f, v) => writeFileSync(join(DATA, f), JSON.stringify(v, null, 2));

const sessions = load('sessions.json', {});
const queue = load('queue.json', []);
// synthetic non-engaged abandoners for the demo (Aug 20 feedback case)
const synthetic = load('contacts.json', [
  { name: 'Dana R.', email: 'dana.demo@example.com', signals: { pages_viewed: ['functional-medicine-certification'], price_block_dwell_s: 22, scroll_depth: 0.8, cart_added: true, chatted: false, stalled_at: 'cart' } },
  { name: 'Priya M.', email: 'priya.demo@example.com', signals: { pages_viewed: ['functional-medicine-certification', 'faq'], faq_opens: 3, visits_14d: 2, cart_added: true, chatted: false, stalled_at: 'checkout_payment' } }
]);
save('contacts.json', synthetic);

const getSession = id => sessions[id] ||= { id, created: new Date().toISOString(), messages: [], state: 'unknown', objection: 'unknown', rigor_resolved: false, buying_signal: false, dismissed: false, abandoned: false, email: null, guardrail_notes: [], triggers: [] };
const persist = () => { save('sessions.json', sessions); save('queue.json', queue); };

const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } }); });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const STATIC = { '/': 'demo/index.html', '/cart': 'demo/cart.html', '/widget.js': 'widget/widget.js', '/dashboard': 'dashboard/index.html' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'OPTIONS') return json(res, 200, {});

    // ---- worker-compatible public endpoints (served through the demo tunnel) ----
    if (url.pathname === '/health') return json(res, 200, { ok: true, brain: publicApiReady() ? 'requesty' : 'missing REQUESTY_API_KEY', rag: 'full-corpus' });
    if (url.pathname === '/chat' && req.method === 'POST') return json(res, 200, await publicChat(await body(req)));
    if (url.pathname === '/email' && req.method === 'POST') return json(res, 200, await publicEmail(await body(req)));

    // ---- API ----
    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const { sessionId, trigger, message } = await body(req);
      const s = getSession(sessionId || 'anon');
      if (s.dismissed && !message) return json(res, 200, { suppressed: true }); // dismissed = silent for session
      if (trigger && !message) {
        if (s.triggers.some(t => !t.startsWith('cart_')) && !trigger.startsWith('cart_')) return json(res, 200, { suppressed: true }); // one proactive attempt/session
        s.triggers.push(trigger);
      }
      const out = await chatTurn(s, { trigger, message });
      persist();
      return json(res, 200, out);
    }
    if (url.pathname === '/api/dismiss' && req.method === 'POST') {
      const { sessionId } = await body(req); getSession(sessionId).dismissed = true; persist();
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/abandon' && req.method === 'POST') {
      const { sessionId, email, name } = await body(req);
      const s = getSession(sessionId); s.abandoned = true; if (email) s.email = email;
      const em = await writeRecoveryEmail({ name: name || 'there', email: email || s.email || 'visitor@example.com' }, s);
      queue.push(em); persist();
      return json(res, 200, { queued: em.id, mode: em.mode, subject: em.subject });
    }
    if (url.pathname === '/api/generate-nonengaged' && req.method === 'POST') {
      const out = [];
      for (const c of synthetic) { const em = await writeRecoveryEmail(c, null); queue.push(em); out.push(em.id); }
      persist();
      return json(res, 200, { queued: out });
    }
    if (url.pathname === '/api/queue') return json(res, 200, queue);
    if (url.pathname.match(/^\/api\/queue\/[^/]+\/(approve|reject)$/) && req.method === 'POST') {
      const [, , , id, action] = url.pathname.split('/');
      const em = queue.find(e => e.id === id);
      if (em) { em.status = action === 'approve' ? 'approved' : 'rejected'; em.decided = new Date().toISOString(); persist(); }
      return json(res, 200, { ok: !!em });
    }
    if (url.pathname === '/api/stats') {
      const ss = Object.values(sessions);
      const count = (arr, key) => arr.reduce((a, s) => { const k = s[key] || 'unknown'; a[k] = (a[k] || 0) + 1; return a; }, {});
      return json(res, 200, {
        kb: kbSummary(),
        sessions: ss.length,
        conversations: ss.filter(s => s.messages.length > 0).length,
        leads_captured: ss.filter(s => s.email).length,
        abandoned: ss.filter(s => s.abandoned).length,
        dismissed: ss.filter(s => s.dismissed).length,
        states: count(ss, 'state'), objections: count(ss, 'objection'),
        guardrail_events: ss.flatMap(s => s.guardrail_notes || []),
        emails: { pending: queue.filter(e => e.status === 'pending').length, approved: queue.filter(e => e.status === 'approved').length, rejected: queue.filter(e => e.status === 'rejected').length, engaged_mode: queue.filter(e => e.mode === 'engaged').length, non_engaged_mode: queue.filter(e => e.mode === 'non_engaged').length }
      });
    }
    if (url.pathname === '/api/reset' && req.method === 'POST') { // clean slate between demo runs
      for (const k of Object.keys(sessions)) delete sessions[k];
      queue.length = 0; persist();
      return json(res, 200, { ok: true });
    }

    // ---- static ----
    const file = STATIC[url.pathname];
    if (file) { res.writeHead(200, { 'content-type': MIME[extname(file)] }); return res.end(readFileSync(join(ROOT, file))); }
    return json(res, 404, { error: 'not found' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  FM Program Advisor — SANDBOX ${MOCK ? '(MOCK brain — set ANTHROPIC_API_KEY for live Claude)' : '(live Claude)'}`
    + `\n  Demo page   http://localhost:${PORT}/`
    + `\n  Cart page   http://localhost:${PORT}/cart`
    + `\n  Dashboard   http://localhost:${PORT}/dashboard\n`);
});
