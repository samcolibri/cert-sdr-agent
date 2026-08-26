/* Demo brain for the GitHub Pages sandbox.
   Two modes:
   - REMOTE: if an API URL is set (?api=https://... or localStorage.advisor_api_url), calls the
     Cloudflare Worker (worker/advisor-worker.js) → real Claude, key stays server-side.
   - SCRIPTED: built-in mock — the exact flows from Gail's vision doc. No secrets in this file.
   State (sessions, email queue, stats) lives in the browser (localStorage) either way. */
(function () {
  const qsApi = new URLSearchParams(location.search).get('api');
  if (qsApi) localStorage.advisor_api_url = qsApi;
  const API = localStorage.advisor_api_url || '';
  const DISCLOSURE = 'I am the FHEA program advisor and I am an AI assistant';

  /* ---------- browser-side store ---------- */
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage['adv_' + k]); } catch { return d; } },
    set: (k, v) => { localStorage['adv_' + k] = JSON.stringify(v); }
  };
  const sessions = () => store.get('sessions', {});
  const saveSession = s => { const all = sessions(); all[s.id] = s; store.set('sessions', all); };
  const getSession = id => sessions()[id] || { id, created: new Date().toISOString(), messages: [], state: 'unknown', objection: 'unknown', rigor_resolved: false, dismissed: false, abandoned: false, email: null, triggers: [] };
  const queue = () => store.get('queue', []);
  const saveQueue = q => store.set('queue', q);

  /* ---------- scripted brain (mirrors server/advisor.mjs mock) ---------- */
  function scripted(session, trigger, userMsg) {
    const first = session.messages.filter(m => m.role === 'assistant').length === 0;
    const m = (userMsg || '').toLowerCase();
    if (first && !userMsg) {
      const opens = {
        price_dwell: `Hi — ${DISCLOSURE}, so you can ask me anything without a sales call. Since you're looking at cost: it's $3,999 one-time with a full year of access, and Affirm financing is available — roughly $334/month over 12 months as an illustration. Want me to break down exactly what that includes?`,
        cart_exit: `Before you go — ${DISCLOSURE}. Totally understand wanting to think a $3,999 decision over. What's the one outstanding question I can answer for you right now?`,
        cart_coupon: `${DISCLOSURE} — quick honest note: there's no coupon floating around, but Affirm financing can spread the $3,999 out monthly. Meanwhile, is cost the only thing giving you pause?`,
        cart_stall: `Still here if you need me — ${DISCLOSURE}. Is there an outstanding question holding you back, or would the Affirm monthly option help?`,
        repeat_visit: `Welcome back — ${DISCLOSURE}. You were here recently, so I won't repeat the tour. What question is still open for you?`,
        known_contact: `Good to see you again — ${DISCLOSURE}. Last time you were interested in the Functional Medicine certification. Want to pick up where you left off, or has a new question come up?`,
        idle: `Still reading? ${DISCLOSURE} — one low-friction offer: I can send you the module-by-module outline to review on your own time. Want it?`
      };
      return { reply: opens[trigger] || `Hi — ${DISCLOSURE}, so you can ask me anything about this certification without a sales call. Most nurse practitioners at this point in the page are trying to work out how clinically deep it actually goes. Want me to walk you through the lab interpretation and prescribing content?`, state: trigger === 'price_dwell' ? 'price_focused' : 'clinically_curious', objection: trigger === 'price_dwell' ? 'cost' : 'rigor', rigor_resolved: false };
    }
    if (/deep|rigor|serious|vibes|supplement|clinical|evidence|different/.test(m)) return { reply: `That's a fair filter. Here is the concrete answer. The program is 95 contact hours, IACET accredited, and 24 of those hours are pharmacology — so it counts toward Rx requirements. There's a full module on lab interpretation in functional medicine, and separate modules on cardiometabolic health, HPA axis dysregulation, immunity and inflammation, and gut health. It's led by Jenni Gallagher, MSN, NP-C, with practicing NP subject-matter experts. If you want, I can send you the full module-by-module outline so you can compare it side by side.`, state: 'clinically_curious', objection: 'rigor', rigor_resolved: true };
    if (/how long|time|finish|pace/.test(m)) return { reply: `It's fully online and self-paced with a year of access, and most providers finish in three to six months. You also keep lifetime access to the core content you purchased even after the year ends. What's your email and I'll send the outline now? I'll also flag the two modules people find most demanding so you can plan around them.`, state: session.state, objection: 'time', rigor_resolved: session.rigor_resolved };
    if (/@/.test(m)) return { reply: `Perfect — sending the module-by-module outline now. Anything else on your mind while you have me? If a question comes up later, I also answer by email, and a human colleague is one message away.`, state: session.state, objection: session.objection, rigor_resolved: true };
    if (/price|cost|afford|worth|financ/.test(m)) return { reply: `It's $3,999 one-time — that includes all 95 contact hours, the exam, and a year of access (with lifetime access to the core content after). Affirm financing is available if monthly works better — illustratively around $334/month over 12 months. Would a breakdown of what's included help?`, state: 'price_focused', objection: 'cost', rigor_resolved: session.rigor_resolved };
    if (/employ|reimburs|state|prescrib|legal/.test(m)) return { reply: `Honest answer: employer reimbursement policies and state-specific prescribing rules aren't something I have verified facts on, and I'd rather not guess. That's exactly what my human colleague is for — want me to flag this conversation for them? Meanwhile I can send the employer-justification one-pager many NPs use.`, state: session.state, objection: 'applicability', rigor_resolved: session.rigor_resolved };
    return { reply: `Here's what I can verify: it's a 95-contact-hour, IACET-accredited program with 24 Rx hours, fully online and self-paced, led by practicing NP faculty. If your question goes beyond the program facts, my human colleague is one message away. What would help most?`, state: session.state, objection: session.objection, rigor_resolved: session.rigor_resolved };
  }

  const scriptedEmail = (contact, session) => {
    const engaged = session && session.messages.length > 0;
    return engaged
      ? { subject: `The ${session.objection === 'rigor' ? 'clinical depth' : (session.objection || 'question')} you asked about — answered`, body: `Hi ${contact.name || 'there'},\n\nIt's the FHEA program advisor (still an AI assistant, still no sales call). When we talked you wanted to know how clinically deep the Functional Medicine Certification really goes — fair question for a $3,999 decision.\n\nThe short answer: 95 IACET-accredited contact hours, 24 of them pharmacology (they count toward Rx requirements), with full modules on lab interpretation, gut health, HPA axis dysregulation, and cardiometabolic health — built and taught by practicing NPs under Jenni Gallagher, MSN, NP-C.\n\nYour cart is saved. If one more question stands between you and a decision, just reply — I answer in minutes, and a human colleague is one message away.\n\n— FHEA Program Advisor (AI)` }
      : { subject: `Your Functional Medicine cart is saved — and your questions have a home`, body: `Hi ${contact.name || 'there'},\n\nYou left the Functional Medicine Certification in your cart — most NPs who do are weighing a real question: is it rigorous enough, is $3,999 justified, is there time for 95 hours?\n\nI'm the FHEA program advisor — an AI assistant who can answer those questions in minutes, no sales call, with a human colleague one message away.\n\nReply with whatever's on your mind, or come back to the page and ask me there. Your cart (and 1-year access + lifetime core-content access) will be waiting.\n\n— FHEA Program Advisor (AI)` };
  };

  /* ---------- guardrails (client-enforced, same rules as the server sandbox) ---------- */
  function guardrails(parsed, session, trigger) {
    let reply = (parsed.reply || '').trim(); const notes = [];
    if (session.messages.filter(x => x.role === 'assistant').length === 0 && !/\bAI\b/i.test(reply)) { reply = `Hi — ${DISCLOSURE}. ` + reply; notes.push('disclosure_injected'); }
    if (reply.length > 900) { const c = reply.slice(0, 900); reply = c.slice(0, Math.max(c.lastIndexOf('. '), c.lastIndexOf('? ')) + 1) || c; notes.push('length_capped'); }
    const priceOK = ['price_dwell', 'cart_exit', 'cart_coupon', 'cart_stall'].includes(trigger) || session.rigor_resolved;
    if (parsed.state === 'clinically_curious' && !parsed.rigor_resolved && !priceOK && /\$\s?[\d,]+|price|cost|affirm|financing/i.test(reply)) {
      reply = reply.split(/(?<=[.!?])\s+/).filter(s => !/\$\s?[\d,]+|price|cost|affirm|financing/i.test(s)).join(' ').trim();
      notes.push('price_stripped_rigor_unresolved');
    }
    return { reply, notes };
  }

  /* ---------- public API used by demo-widget.js and the demo pages ---------- */
  window.AdvisorBrain = {
    remote: !!API,
    async chat(sessionId, { trigger, message }) {
      const s = getSession(sessionId);
      if (s.dismissed && !message) return { suppressed: true };
      if (trigger && !message) {
        const nonCart = s.triggers.filter(t => t.indexOf('cart_') !== 0);
        if (nonCart.length && trigger.indexOf('cart_') !== 0) return { suppressed: true };
        s.triggers.push(trigger);
      }
      let parsed;
      if (API) {
        const r = await fetch(API + '/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: s.messages, trigger, message, state: s.state, rigor_resolved: s.rigor_resolved }) });
        parsed = await r.json();
        if (parsed.error) throw new Error(parsed.error);
      } else {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 600)); // human-ish latency
        parsed = scripted(s, trigger, message);
      }
      const g = guardrails(parsed, s, trigger);
      if (message) s.messages.push({ role: 'user', content: message });
      s.messages.push({ role: 'assistant', content: g.reply });
      s.state = parsed.state || s.state; s.objection = (parsed.objection && parsed.objection !== 'unknown') ? parsed.objection : s.objection;
      s.rigor_resolved = parsed.rigor_resolved || s.rigor_resolved;
      const em = (message || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/); if (em) s.email = em[0];
      s.guardrail_notes = (s.guardrail_notes || []).concat(g.notes);
      saveSession(s);
      return { reply: g.reply, state: s.state, objection: s.objection, rigor_resolved: s.rigor_resolved, guardrails: g.notes };
    },
    dismiss(sessionId) { const s = getSession(sessionId); s.dismissed = true; saveSession(s); },
    async abandon(sessionId, contact) {
      const s = getSession(sessionId); s.abandoned = true; if (contact.email) s.email = contact.email; saveSession(s);
      const engaged = s.messages.length > 0;
      let em;
      if (API) {
        const r = await fetch(API + '/email', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: engaged ? 'engaged' : 'non_engaged', contact, messages: s.messages, state: s.state, objection: s.objection, signals: contact.signals || {} }) });
        em = await r.json();
      } else { em = scriptedEmail(contact, s); }
      const entry = { id: 'em_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), mode: engaged ? 'engaged' : 'non_engaged', contact, subject: em.subject, body: em.body, grounded_in: engaged ? { state: s.state, objection: s.objection, turns: s.messages.length } : { signals: contact.signals || {} }, status: 'pending', created: new Date().toISOString() };
      const q = queue(); q.push(entry); saveQueue(q);
      return entry;
    },
    async generateNonEngaged() {
      const synthetic = [
        { name: 'Dana R.', email: 'dana.demo@example.com', signals: { price_block_dwell_s: 22, scroll_depth: 0.8, cart_added: true, chatted: false, stalled_at: 'cart' } },
        { name: 'Priya M.', email: 'priya.demo@example.com', signals: { faq_opens: 3, visits_14d: 2, cart_added: true, chatted: false, stalled_at: 'checkout_payment' } }
      ];
      const out = [];
      for (const c of synthetic) out.push(await this.abandon('synthetic_' + c.email, c));
      return out;
    },
    decide(id, action) { const q = queue(); const e = q.find(x => x.id === id); if (e) { e.status = action; e.decided = new Date().toISOString(); saveQueue(q); } },
    queue, sessions,
    stats() {
      const ss = Object.values(sessions()); const q = queue();
      const count = (arr, key) => arr.reduce((a, s) => { const k = s[key] || 'unknown'; a[k] = (a[k] || 0) + 1; return a; }, {});
      return { brain: API ? 'live API (' + API + ')' : 'scripted demo brain (vision-doc flows) — plug a Worker URL via ?api= for live Claude',
        sessions: ss.length, conversations: ss.filter(s => s.messages.length).length, leads_captured: ss.filter(s => s.email).length,
        abandoned: ss.filter(s => s.abandoned).length, dismissed: ss.filter(s => s.dismissed).length,
        states: count(ss, 'state'), objections: count(ss, 'objection'),
        guardrail_events: ss.flatMap(s => s.guardrail_notes || []),
        emails: { pending: q.filter(e => e.status === 'pending').length, approved: q.filter(e => e.status === 'approved').length, rejected: q.filter(e => e.status === 'rejected').length, engaged_mode: q.filter(e => e.mode === 'engaged').length, non_engaged_mode: q.filter(e => e.mode === 'non_engaged').length } };
    },
    reset() { Object.keys(localStorage).filter(k => k.indexOf('adv_') === 0).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); }
  };
})();
