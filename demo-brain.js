/* Demo brain for the GitHub Pages sandbox, three modes, picked automatically:
   1. WORKER:   ?api=https://... (or saved) → backend proxy, key server-side.
   2. REQUESTY: a Requesty router key connected in THIS browser (?rkey=... once, or the
      "connect live brain" prompt) → real claude-sonnet-5; the key lives ONLY in this
      browser's localStorage, is stripped from the URL immediately, and never appears
      in the repo or the page source.
   3. SCRIPTED: built-in flows from the vision doc, zero secrets, never dies.
   State (sessions, email queue, stats) lives in the browser either way. */
(function () {
  const qs = new URLSearchParams(location.search);
  if (qs.get('api')) localStorage.advisor_api_url = qs.get('api');
  if (qs.get('rkey')) {
    localStorage.advisor_rkey = qs.get('rkey');
    qs.delete('rkey');
    const rest = qs.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : ''));
  }
  // DEFAULT_API: the deployed Worker (key server-side), set after first CI deploy.
  // When present, EVERY visitor gets the live brain from the plain URL, no key anywhere client-side.
  const DEFAULT_API = 'https://gate-heroes-munich-carriers.trycloudflare.com';
  let API = localStorage.advisor_api_url || '';
  const apiReady = (async () => {
    try {
      if (API) return;
      if (localStorage.advisor_rkey) return; // browser-held key = laptop-independent brain; prefer it over the tunnel
      const r = await fetch('live-config.json?cb=' + Math.random());
      if (r.ok) { const c = await r.json(); if (c && c.api) { API = c.api; return; } }
    } catch (e) {}
    if (!API && !localStorage.advisor_rkey) API = DEFAULT_API;
  })();
  const rkey = () => localStorage.advisor_rkey || '';
  const REQUESTY_URL = 'https://router.requesty.ai/v1/chat/completions';
  // Cost-tuned: fast/cheap model for chat turns, premium model only for recovery emails.
  const CHAT_MODEL = localStorage.advisor_model || 'anthropic/claude-haiku-4-5';
  const EMAIL_MODEL = localStorage.advisor_email_model || 'anthropic/claude-sonnet-5';
  const DISCLOSURE = 'I am the FHEA program advisor and I am an AI assistant';

  /* ---------- the full trained brain: persona + verified KB (mirrors kb/facts.json) ---------- */
  const FACTS = [
    'Upon successful completion you earn the FMP-C credential, The Elite NP Functional Medicine Certification.',
    'FHEA has partnered with The Elite Nurse Practitioner to offer this certification.',
    'Program cost is $3,999, one-time fee for the full certification and 1-year access.',
    "Affirm financing is available on FHEA. Exact monthly figures are computed by Affirm at checkout, say 'financing available via Affirm' plus an illustrative ~$334/mo over 12 months, always labeled illustrative.",
    'Accredited for 95 contact hours, including 24 Rx (pharmacology) hours that count toward prescribing requirements.',
    'Elite NP partnered with NetCE for development; NetCE is an IACET Accredited Provider (ANSI/IACET standard).',
    'Completely online and self-paced. 1 year to complete; most providers finish in 3–6 months.',
    'Lifetime access to the core certification content available at time of purchase, even after the certification year ends.',
    'No prior functional medicine experience needed, foundational concepts through advanced protocols.',
    'Immediately applicable in primary care, urgent care, specialty clinics, or your own practice.',
    'This certification is EXCLUDED from FHEA Memberships and must be purchased separately.',
    'Program Director: Jenni Gallagher, MSN, NP-C, board-certified NP in Functional Medicine, endocrinology, metabolic health.',
    'Course authors/SMEs: Brendan Tennefoss NP, Keri Douglas NP, Justin Groce NP, Haley Stevens NP, Lisa Vasile NP, Danielle Hawkins NP, Nicholas Goodwin PMHNP.',
    'Modules: Legalities/Regulations/Risks; Foundations of Functional Medicine; Lab Interpretation; Gut Health & the Biome; Immunity & Inflammation; Sex Hormones; Cardiometabolic Health; Environmental Toxins; HPA Axis Dysregulation; Integrative Mental Health; Trauma/Stress/Mind-Body; Business & Practice Growth.',
    "Lab Interpretation module: tighter 'optimal' ranges vs conventional, functional markers beyond CBC/CMP, pattern-based early-dysfunction detection.",
    'Gut Health module: GI tract as epicenter of health/disease; treatment via digestion, absorption, elimination, microbiome pillars.',
    'Business module: launch and scale a profitable functional-medicine clinic, cash vs insurance models, pricing, lab partnerships, marketing to cash-pay patients.',
    'Path: build foundations → master clinical & lab skills → case studies and assessments → pass the exam → certification.',
    'vs other programs: designed specifically for NPs; no $20K+ price tags; real-world clinical AND business strategies; fully online, self-paced.',
    'Market: ~10,300+ U.S. clinicians hold a functional-medicine credential; ~60 million chronically ill U.S. adults seek functional medicine; average provider earnings $221,000 (IQR $153k–$283k).',
    'Legalities module: low-to-moderate liability, covered under malpractice insurance; treat within scope and refer when appropriate.'
  ];
  const TRIGGER_MOVES = {
    dwell_scroll: '45s+ dwell, 60% scroll, no CTA click. Offer the thing most people at that scroll position ask about: how clinically deep it actually goes.',
    price_dwell: '10s+ on the price block. Lead with total cost clarity and Affirm, unprompted. Price talk IS appropriate for this trigger.',
    faq_repeat: 'FAQ accordion opened twice+. Answer the category directly instead of making her read.',
    repeat_visit: 'Second+ visit within 14 days. Acknowledge the return warmly, ask what is still open.',
    known_contact: 'Known contact (HubSpot cookie match, simulated). Skip discovery, go straight to the open question.',
    idle: '90s idle mid-page. One low-friction offer, then be ready to go quiet.',
    cart_exit: 'CART RESCUE: exit intent on the cart page ($3,999 in cart). Name and remove the single most likely blocker in one short message, or ask what outstanding question she has.',
    cart_coupon: 'CART RESCUE: coupon hunting. Reinforce full value; Affirm is the legitimate cost-easer. Do NOT invent a discount.',
    cart_stall: 'CART RESCUE: payment step idle. Gently ask what outstanding question she has, or offer the Affirm option (illustrative).'
  };
  const SYSTEM = 'You are the FHEA program advisor, the customer-facing persona of the Functional Medicine AI SDR for the Functional Medicine Certification (FMP-C).\n\n' +
    'IDENTITY & DISCLOSURE\n- Warm, knowledgeable program advisor. On your FIRST message of a conversation say plainly you are an AI assistant ("' + DISCLOSURE + ', so you can ask me anything without a sales call") and that a human colleague is one message away.\n- Plain, concrete, peer-to-peer with a nurse practitioner. Never salesy.\n\n' +
    'HARD RULES\n- SHORT messages: 2-5 sentences. Never a wall of text.\n- Answer ONLY from the verified facts below. Not covered (state prescribing authority, employer reimbursement, medical advice)? Say so and offer the human colleague. NEVER guess.\n- NEVER invent discounts. You may offer: the module outline, the employer-justification one-pager, Affirm info (illustrative only), a human colleague.\n- OBJECTION-SEQUENCED SELLING: if decision state is clinically_curious and rigor is unresolved, do NOT bring up price/cost/financing yourself (exceptions: she asks price directly, answer in ONE short sentence then return to the open objection; or price_dwell / cart_* triggers where price IS the topic).\n- rigor_resolved becomes true ONLY after she signals the depth answer landed (asks for the outline, says that helps, moves to logistics). Answering once does NOT resolve it.\n- ALWAYS work toward the sale: every message ends with exactly one low-friction next step (outline via email, a specific module walkthrough, the cart link when buying_signal is true). One question max per message.\n\n' +
    'VERIFIED FACTS\n' + FACTS.map(f => '- ' + f).join('\n') + '\n\n' +
    'STYLE (strict, American): everyday American English, short and punchy. NEVER use em-dashes or en-dashes anywhere. Use commas, periods, or hyphens instead (ranges like 3-6 months use a hyphen). Keep every reply to 2-3 short lines total. Giving 2 or more facts? You MUST format them as hyphen bullets, one per line, each under 15 words. Never chain facts with commas into one long sentence. EXAMPLE of the required multi-fact format: \"Short direct answer first.\n- ~60M chronically ill U.S. adults are seeking functional medicine\n- NPs never got this training in school\n- Average provider earnings: $221,000\nWant the module outline?\"\n\nANSWER-FIRST RULE (highest priority): when she asks a question, what/why/how/does it/is it, give the substantive answer IMMEDIATELY in your first sentence, with concrete facts. NEVER answer a question with a question. NEVER say "let me ask you back" or make her qualify herself (role, practice, goals) before she gets the answer. Broad questions ("why does this matter?") get the concrete case: patients are asking about functional medicine (~60M chronically ill U.S. adults seek it), NPs were never taught it in school, and providers who add it report strong earnings (avg $221,000), THEN one short follow-up at most. If she opens with just a greeting, do not ask an open "what brings you here", offer the most common concrete starting point: how clinically deep the program goes.\n\nHUMAN EXPERT: a human expert is part of your sequence, not a failure mode. If she asks for a human, or asks something outside the verified facts twice, set escalate=true and tell her a named expert will follow up (do not invent the expert’s name).\n\n' +
    'OUTPUT, ONLY a JSON object, no fences:\n{"answer":"<direct answer, max 20 words>","points":["<0-3 bullets, max 12 words each, never repeating the answer>"],"next_step":"<max 12 words, one question or CTA>","state":"<clinically_curious|price_focused|career_pivot|employer_funded|browsing|unknown>","objection":"<rigor|cost|time|value|applicability|none|unknown>","rigor_resolved":<bool>,"buying_signal":<bool>,"escalate":<bool>}';

  /* ---------- RAG: distilled course knowledge pack (public, 34 modules / 387 facts) ---------- */
  let PACK = null;
  fetch('kb/kb-pack.json').then(r => r.ok ? r.json() : null).then(p => { PACK = p; }).catch(() => {});
  const STOPW = { the: 1, a: 1, an: 1, and: 1, or: 1, of: 1, to: 1, in: 1, for: 1, with: 1, on: 1, is: 1, are: 1, it: 1, how: 1, what: 1, does: 1, do: 1, this: 1, that: 1, i: 1, you: 1, my: 1 };
  const toks = s => (String(s).toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(w => !STOPW[w]);
  function retrievePack(query, k) {
    if (!PACK || !PACK.entries) return [];
    const q = toks(query); if (!q.length) return [];
    const scored = PACK.entries.map(e => {
      const hay = (e.title + ' ' + e.pitch + ' ' + e.keywords.join(' ') + ' ' + e.facts.join(' ')).toLowerCase();
      let s = 0; for (const t of q) { if (e.keywords.join(' ').toLowerCase().includes(t)) s += 3; else if (hay.includes(t)) s += 1; }
      return [s, e];
    }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]);
    return scored.slice(0, k || 2).map(x => x[1]);
  }
  function ragBlock(query) {
    const hits = retrievePack(query, 2);
    if (!hits.length) return '';
    return '\n\nRETRIEVED COURSE KNOWLEDGE (distilled from the actual course modules, use it to demonstrate depth and answer "does it cover X"; describe what the course TEACHES, never give clinical advice yourself):\n'
      + hits.map(e => `### ${e.title}\nPitch: ${e.pitch}\n${e.facts.map(f => '- ' + f).join('\n')}`).join('\n');
  }

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

  /* ---------- requesty (browser-direct, OpenAI-compatible) ---------- */
  function parseJSON(text) {
    try { return JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()); }
    catch { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m[0]); } catch { return { reply: text.slice(0, 500), state: 'unknown', objection: 'unknown', rigor_resolved: false }; } }
  }
  async function requesty(model, system, messages, maxTokens) {
    const r = await fetch(REQUESTY_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + rkey(), 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }].concat(messages) })
    });
    const d = await r.json();
    if (!r.ok || d.error) throw new Error((d.error && d.error.message) || ('router ' + r.status));
    if (d.choices && d.choices[0] && d.choices[0].finish_reason === 'length' && maxTokens < 1600) return requesty(model, system, messages, Math.round(maxTokens * 1.8));
    return parseJSON(d.choices[0].message.content);
  }

  /* ---------- scripted fallback (vision-doc flows) ---------- */
  function scripted(session, trigger, userMsg) {
    const first = session.messages.filter(m => m.role === 'assistant').length === 0;
    const m = (userMsg || '').toLowerCase();
    if (first && !userMsg) {
      const opens = {
        price_dwell: `Hi, ${DISCLOSURE}, so you can ask me anything without a sales call. Since you're looking at cost: it's $3,999 one-time with a full year of access, and Affirm financing is available, roughly $334/month over 12 months as an illustration. Want me to break down exactly what that includes?`,
        cart_exit: `Before you go, ${DISCLOSURE}. Totally understand wanting to think a $3,999 decision over. What's the one outstanding question I can answer for you right now?`,
        cart_coupon: `${DISCLOSURE}, quick honest note: there's no coupon floating around, but Affirm financing can spread the $3,999 out monthly. Meanwhile, is cost the only thing giving you pause?`,
        cart_stall: `Still here if you need me, ${DISCLOSURE}. Is there an outstanding question holding you back, or would the Affirm monthly option help?`,
        repeat_visit: `Welcome back, ${DISCLOSURE}. You were here recently, so I won't repeat the tour. What question is still open for you?`,
        known_contact: `Good to see you again, ${DISCLOSURE}. Last time you were interested in the Functional Medicine certification. Want to pick up where you left off, or has a new question come up?`,
        idle: `Still reading? ${DISCLOSURE}, one low-friction offer: I can send you the module-by-module outline to review on your own time. Want it?`
      };
      return { reply: opens[trigger] || `Hi, ${DISCLOSURE}, so you can ask me anything about this certification without a sales call. Most nurse practitioners at this point in the page are trying to work out how clinically deep it actually goes. Want me to walk you through the lab interpretation and prescribing content?`, state: trigger === 'price_dwell' ? 'price_focused' : 'clinically_curious', objection: trigger === 'price_dwell' ? 'cost' : 'rigor', rigor_resolved: false };
    }
    if (/deep|rigor|serious|vibes|supplement|clinical|evidence|different/.test(m)) return { reply: `That's a fair filter. Here is the concrete answer. The program is 95 contact hours, IACET accredited, and 24 of those hours are pharmacology, so it counts toward Rx requirements. There's a full module on lab interpretation in functional medicine, and separate modules on cardiometabolic health, HPA axis dysregulation, immunity and inflammation, and gut health. It's led by Jenni Gallagher, MSN, NP-C, with practicing NP subject-matter experts. If you want, I can send you the full module-by-module outline so you can compare it side by side.`, state: 'clinically_curious', objection: 'rigor', rigor_resolved: true };
    if (/how long|time|finish|pace/.test(m)) return { reply: `It's fully online and self-paced with a year of access, and most providers finish in three to six months. You also keep lifetime access to the core content you purchased even after the year ends. What's your email and I'll send the outline now? I'll also flag the two modules people find most demanding so you can plan around them.`, state: session.state, objection: 'time', rigor_resolved: session.rigor_resolved };
    if (/@/.test(m)) return { reply: `Perfect, sending the module-by-module outline now. Anything else on your mind while you have me? If a question comes up later, I also answer by email, and a human colleague is one message away.`, state: session.state, objection: session.objection, rigor_resolved: true };
    if (/price|cost|afford|worth|financ/.test(m)) return { reply: `It's $3,999 one-time, that includes all 95 contact hours, the exam, and a year of access (with lifetime access to the core content after). Affirm financing is available if monthly works better, illustratively around $334/month over 12 months. Would a breakdown of what's included help?`, state: 'price_focused', objection: 'cost', rigor_resolved: session.rigor_resolved };
    if (/employ|reimburs|state|prescrib|legal/.test(m)) return { reply: `Honest answer: employer reimbursement policies and state-specific prescribing rules aren't something I have verified facts on, and I'd rather not guess. That's exactly what my human colleague is for, want me to flag this conversation for them? Meanwhile I can send the employer-justification one-pager many NPs use.`, state: session.state, objection: 'applicability', rigor_resolved: session.rigor_resolved };
    return { reply: `Here's what I can verify: it's a 95-contact-hour, IACET-accredited program with 24 Rx hours, fully online and self-paced, led by practicing NP faculty. If your question goes beyond the program facts, my human colleague is one message away. What would help most?`, state: session.state, objection: session.objection, rigor_resolved: session.rigor_resolved };
  }

  const scriptedEmail = (contact, session) => {
    const engaged = session && session.messages.length > 0;
    return engaged
      ? { subject: `The ${session.objection === 'rigor' ? 'clinical depth' : (session.objection || 'question')} you asked about, answered`, body: `Hi ${contact.name || 'there'},\n\nIt's the FHEA program advisor (still an AI assistant, still no sales call). When we talked you wanted to know how clinically deep the Functional Medicine Certification really goes, fair question for a $3,999 decision.\n\nThe short answer: 95 IACET-accredited contact hours, 24 of them pharmacology (they count toward Rx requirements), with full modules on lab interpretation, gut health, HPA axis dysregulation, and cardiometabolic health, built and taught by practicing NPs under Jenni Gallagher, MSN, NP-C.\n\nYour cart is saved. If one more question stands between you and a decision, just reply, I answer in minutes, and a human colleague is one message away.\n\n— FHEA Program Advisor (AI)` }
      : { subject: `Your Functional Medicine cart is saved, and your questions have a home`, body: `Hi ${contact.name || 'there'},\n\nYou left the Functional Medicine Certification in your cart, most NPs who do are weighing a real question: is it rigorous enough, is $3,999 justified, is there time for 95 hours?\n\nI'm the FHEA program advisor, an AI assistant who can answer those questions in minutes, no sales call, with a human colleague one message away.\n\nReply with whatever's on your mind, or come back to the page and ask me there. Your cart (and 1-year access + lifetime core-content access) will be waiting.\n\n— FHEA Program Advisor (AI)` };
  };

  /* ---------- guardrails (client-enforced, same rules as the server sandbox) ---------- */
function trimCut(t) {
    const lines = String(t || '').split('\n');
    while (lines.length > 1 && !/[.!?)\"']$/.test(lines[lines.length - 1].trim())) lines.pop();
    let out = lines.join('\n').trim();
    if (!/[.!?)\"']$/.test(out)) {
      const i = Math.max(out.lastIndexOf('. '), out.lastIndexOf('? '), out.lastIndexOf('! '));
      if (i > 40) out = out.slice(0, i + 1);
    }
    return out;
  }
  function deDash(t) {
    return String(t || '')
      .replace(/(\d[a-z]?)\s*[\u2013\u2014]\s*(\$?\d)/gi, '$1-$2')
      .replace(/\s*[\u2013\u2014]\s*/g, ', ');
  }
function composeReply(o) {
    if (!o) return;
    if (o.answer !== undefined || o.points || o.next_step) {
      const pts = Array.isArray(o.points) ? o.points.slice(0, 4).map(p => '- ' + String(p).trim().replace(/^[-•]\s*/, '')) : [];
      o.reply = [String(o.answer || o.reply || '').trim(), ...pts, String(o.next_step || '').trim()].filter(Boolean).join('\n');
    }
  }
  function guardrails(parsed, session, trigger) {
    let reply = trimCut(deDash((parsed.reply || '').trim())); const notes = [];
    if (session.messages.filter(x => x.role === 'assistant').length === 0 && !/\bAI\b/i.test(reply)) { reply = `Hi, ${DISCLOSURE}. ` + reply; notes.push('disclosure_injected'); }
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
    mode() { return API ? 'worker' : (rkey() ? 'requesty' : 'scripted'); },
    modeLabel() { return API ? 'live via Worker' : (rkey() ? 'LIVE haiku-4-5 chat + sonnet-5 emails via Requesty' : 'scripted demo brain'); },
    connect() {
      const k = prompt('Paste a Requesty router key (stays ONLY in this browser, localStorage):');
      if (k && k.trim()) { localStorage.advisor_rkey = k.trim(); location.reload(); }
    },
    disconnect() {
      localStorage.removeItem('advisor_rkey');
      localStorage.removeItem('advisor_api_url');
      location.reload();
    },
    async chat(sessionId, { trigger, message }) {
      await apiReady;
      const s = getSession(sessionId);
      if (s.dismissed && !message) return { suppressed: true };
      if (trigger && !message) {
        const nonCart = s.triggers.filter(t => t.indexOf('cart_') !== 0);
        if (nonCart.length && trigger.indexOf('cart_') !== 0) return { suppressed: true };
        s.triggers.push(trigger);
      }
      let parsed;
      if (API) {
        const r = await fetch(API + '/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: s.messages, trigger, message, state: s.state, rigor_resolved: s.rigor_resolved, rag: message ? ragBlock(message) : '' }) });
        parsed = await r.json(); if (parsed.error) throw new Error(parsed.error);
      } else if (rkey()) {
        const convo = s.messages.map(m => ({ role: m.role, content: m.content }));
        const ragHits = message ? retrievePack(message, 2) : [];
        const rag = message ? ragBlock(message) : '';
        convo.push({ role: 'user', content: message ? String(message).slice(0, 2000) : `[PROACTIVE GREETING, no user message yet. Trigger: ${trigger}. ${TRIGGER_MOVES[trigger] || ''} Write your opening message now.]` });
        parsed = await requesty(CHAT_MODEL, SYSTEM + rag, convo, 700);
        composeReply(parsed);
        if (parsed && ragHits.length) parsed.sources = ragHits.map(e => e.title);
      } else {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 600));
        parsed = scripted(s, trigger, message);
      }
      const g = guardrails(parsed, s, trigger);
      if (message) s.messages.push({ role: 'user', content: message });
      s.messages.push({ role: 'assistant', content: g.reply });
      s.state = parsed.state || s.state; s.objection = (parsed.objection && parsed.objection !== 'unknown') ? parsed.objection : s.objection;
      s.rigor_resolved = parsed.rigor_resolved || s.rigor_resolved;
      const em = (message || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/); if (em) s.email = em[0];
      s.guardrail_notes = (s.guardrail_notes || []).concat(g.notes);
      if (parsed.escalate && !s.expert_assigned) {
        s.expert_assigned = new Date().toISOString();
        const ex = store.get('experts', []);
        ex.push({ session: s.id, email: s.email || '(not captured yet)', state: s.state, objection: s.objection, question: (message || '').slice(0, 200), assigned: s.expert_assigned, status: 'awaiting_expert' });
        store.set('experts', ex);
      }
      saveSession(s);
      return { reply: g.reply, state: s.state, objection: s.objection, rigor_resolved: s.rigor_resolved, guardrails: g.notes, escalate: !!parsed.escalate, sources: parsed.sources || [] };
    },
    dismiss(sessionId) { const s = getSession(sessionId); s.dismissed = true; saveSession(s); },
    async abandon(sessionId, contact) {
      await apiReady;
      const s = getSession(sessionId); s.abandoned = true; if (contact.email) s.email = contact.email; saveSession(s);
      const engaged = s.messages.length > 0;
      let em;
      if (API) {
        const r = await fetch(API + '/email', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: engaged ? 'engaged' : 'non_engaged', contact, messages: s.messages, state: s.state, objection: s.objection, signals: contact.signals || {}, rag: ragBlock(engaged ? s.messages.map(m => m.content).join(' ').slice(-1200) : JSON.stringify(contact.signals || {})) }) });
        em = await r.json();
      } else if (rkey()) {
        const ctx = engaged
          ? `MODE: ENGAGED. Conversation:\n${s.messages.map(m => m.role + ': ' + m.content).join('\n').slice(0, 8000)}\nState: ${s.state}; objection: ${s.objection}.\nWrite the recovery email as a CONTINUATION of this conversation. Subject references her actual objection; body answers it; invite reply.`
          : `MODE: NON-ENGAGED, she never talked to you. Signals: ${JSON.stringify(contact.signals || {}).slice(0, 1000)}.\nWrite a personal email grounded in her signals, INVITING her to interact with the advisor to get answers and complete the purchase. Never a template.`;
        const ragQ = engaged ? s.messages.map(m => m.content).join(' ').slice(-1200) : JSON.stringify(contact.signals || {});
        const sys = SYSTEM.replace('OUTPUT, ONLY a JSON object, no fences:', 'You are writing a recovery EMAIL (same identity, AI disclosure in the signature, verified facts only, no invented discounts, 120-180 words). OUTPUT, ONLY a JSON object:')
          .replace(/\{"answer".*$/s, '{"subject":"<subject>","body":"<plain-text email signed as the advisor with AI disclosure>"}') + ragBlock(ragQ);
        em = await requesty(EMAIL_MODEL, sys, [{ role: 'user', content: ctx }], 1100);
        if (em) { em.subject = deDash(em.subject); em.body = deDash(em.body); }
        if (!em || !em.body) {                       // model returned an unexpected shape, normalize or fall back
          const text = em && (em.reply || em.subject) ? (em.reply || '') : '';
          em = text.length > 80
            ? { subject: (em && em.subject) || 'About the certification you were considering', body: text }
            : scriptedEmail(contact, s);
        }
        if (!/\bAI\b/i.test(em.body)) em.body += '\n\n- FHEA Program Advisor (AI assistant, a human colleague is one message away)';
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
    experts() { return store.get('experts', []); },
    queue, sessions,
    stats() {
      const ss = Object.values(sessions()); const q = queue();
      const count = (arr, key) => arr.reduce((a, s) => { const k = s[key] || 'unknown'; a[k] = (a[k] || 0) + 1; return a; }, {});
      return { brain: this.modeLabel(),
        kb_pack: PACK ? PACK.entries.length + ' course modules / ' + PACK.entries.reduce((a, e) => a + e.facts.length, 0) + ' facts loaded' : 'not loaded',
        sessions: ss.length, conversations: ss.filter(s => s.messages.length).length, leads_captured: ss.filter(s => s.email).length,
        expert_assignments: store.get('experts', []).length,
        abandoned: ss.filter(s => s.abandoned).length, dismissed: ss.filter(s => s.dismissed).length,
        states: count(ss, 'state'), objections: count(ss, 'objection'),
        guardrail_events: ss.flatMap(s => s.guardrail_notes || []),
        emails: { pending: q.filter(e => e.status === 'pending').length, approved: q.filter(e => e.status === 'approved').length, rejected: q.filter(e => e.status === 'rejected').length, engaged_mode: q.filter(e => e.mode === 'engaged').length, non_engaged_mode: q.filter(e => e.mode === 'non_engaged').length } };
    },
    reset() { Object.keys(localStorage).filter(k => k.indexOf('adv_') === 0).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); }
  };
})();
