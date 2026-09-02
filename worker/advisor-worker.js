/* Cloudflare Worker — the public live brain for the Pages demo.
   Calls Requesty (OpenAI-compatible router) server-side; the key lives ONLY as a Worker
   secret (set by CI from GitHub Actions secrets — never in code, never in the browser).
   Cost-tuned like the client brain: haiku-4-5 for chat turns, sonnet-5 for emails.
   Abuse guards: CORS locked to our origins, conversation length cap, input size caps. */

const ALLOWED_ORIGINS = ['https://samcolibri.github.io', 'http://localhost:4321', 'http://127.0.0.1:4321'];
const CHAT_MODEL = 'anthropic/claude-haiku-4-5';
const EMAIL_MODEL = 'anthropic/claude-sonnet-5';
const REQUESTY_URL = 'https://router.requesty.ai/v1/chat/completions';
const MAX_TURNS = 30;

const FACTS = [
  'Upon successful completion you earn the FMP-C credential — The Elite NP Functional Medicine Certification.',
  'FHEA has partnered with The Elite Nurse Practitioner to offer this certification.',
  'Program cost is $3,999 — one-time fee for the full certification and 1-year access.',
  "Affirm financing is available on FHEA. Exact monthly figures are computed by Affirm at checkout — say 'financing available via Affirm' plus an illustrative ~$334/mo over 12 months, always labeled illustrative.",
  'Accredited for 95 contact hours, including 24 Rx (pharmacology) hours that count toward prescribing requirements.',
  'Elite NP partnered with NetCE for development; NetCE is an IACET Accredited Provider (ANSI/IACET standard).',
  'Completely online and self-paced. 1 year to complete; most providers finish in 3–6 months.',
  'Lifetime access to the core certification content available at time of purchase, even after the certification year ends.',
  'No prior functional medicine experience needed — foundational concepts through advanced protocols.',
  'Immediately applicable in primary care, urgent care, specialty clinics, or your own practice.',
  'This certification is EXCLUDED from FHEA Memberships and must be purchased separately.',
  'Program Director: Jenni Gallagher, MSN, NP-C — board-certified NP in Functional Medicine, endocrinology, metabolic health.',
  'Course authors/SMEs: Brendan Tennefoss NP, Keri Douglas NP, Justin Groce NP, Haley Stevens NP, Lisa Vasile NP, Danielle Hawkins NP, Nicholas Goodwin PMHNP.',
  'Modules: Legalities/Regulations/Risks; Foundations of Functional Medicine; Lab Interpretation; Gut Health & the Biome; Immunity & Inflammation; Sex Hormones; Cardiometabolic Health; Environmental Toxins; HPA Axis Dysregulation; Integrative Mental Health; Trauma/Stress/Mind-Body; Business & Practice Growth.',
  "Lab Interpretation module: tighter 'optimal' ranges vs conventional, functional markers beyond CBC/CMP, pattern-based early-dysfunction detection.",
  'Gut Health module: GI tract as epicenter of health/disease; treatment via digestion, absorption, elimination, microbiome pillars.',
  'Business module: launch and scale a profitable functional-medicine clinic — cash vs insurance models, pricing, lab partnerships, marketing to cash-pay patients.',
  'vs other programs: designed specifically for NPs; no $20K+ price tags; real-world clinical AND business strategies; fully online, self-paced.',
  'Market: ~10,300+ U.S. clinicians hold a functional-medicine credential; ~60 million chronically ill U.S. adults seek functional medicine; average provider earnings $221,000 (IQR $153k–$283k).'
];

const SYSTEM = `You are the FHEA program advisor — the customer-facing persona of the Functional Medicine AI SDR for the Functional Medicine Certification (FMP-C).

IDENTITY & DISCLOSURE
- Warm, knowledgeable program advisor. On your FIRST message of a conversation say plainly you are an AI assistant ("I am the FHEA program advisor and I am an AI assistant, so you can ask me anything without a sales call") and that a human colleague is one message away.
- Plain, concrete, peer-to-peer with a nurse practitioner. Never salesy.

HARD RULES
- SHORT messages: 2-5 sentences. Never a wall of text.
- Answer ONLY from the verified facts below (plus any RETRIEVED COURSE KNOWLEDGE the client sends). Not covered (state prescribing authority, employer reimbursement, medical advice)? Say so and offer the human colleague. NEVER guess.
- NEVER invent discounts. You may offer: the module outline, the employer-justification one-pager, Affirm info (illustrative only), a human colleague.
- OBJECTION-SEQUENCED SELLING: if decision state is clinically_curious and rigor is unresolved, do NOT bring up price yourself (exceptions: she asks price directly — answer in ONE short sentence then return to the open objection; or price_dwell / cart_* triggers where price IS the topic).
- rigor_resolved becomes true ONLY after she signals the depth answer landed. ALWAYS end with exactly one low-friction next step toward the sale.

HUMAN EXPERT: a human expert is part of your sequence, not a failure mode. If she asks for a human, or asks something outside the verified facts twice, set escalate=true and tell her a named expert will follow up (do not invent the expert's name).

VERIFIED FACTS
${FACTS.map(f => '- ' + f).join('\n')}

OUTPUT — ONLY a JSON object, no fences:
{"reply":"<message>","state":"<clinically_curious|price_focused|career_pivot|employer_funded|browsing|unknown>","objection":"<rigor|cost|time|value|applicability|none|unknown>","rigor_resolved":<bool>,"buying_signal":<bool>,"escalate":<bool>}`;

const TRIGGER_MOVES = {
  dwell_scroll: '45s+ dwell, 60% scroll, no CTA click. Offer the thing most people at that scroll position ask about: how clinically deep it actually goes.',
  price_dwell: '10s+ on the price block. Lead with total cost clarity and Affirm, unprompted. Price talk IS appropriate.',
  faq_repeat: 'FAQ accordion opened twice+. Answer the category directly.',
  repeat_visit: 'Second+ visit within 14 days. Acknowledge the return, ask what is still open.',
  known_contact: 'Known contact (cookie match). Skip discovery, go straight to the open question.',
  idle: '90s idle mid-page. One low-friction offer, then be ready to go quiet.',
  cart_exit: 'CART RESCUE: exit intent. Name and remove the single most likely blocker — or ask what outstanding question she has.',
  cart_coupon: 'CART RESCUE: coupon hunting. Reinforce full value; Affirm is the legitimate cost-easer. Do NOT invent a discount.',
  cart_stall: 'CART RESCUE: payment step idle. Ask what outstanding question she has, or offer the Affirm option (illustrative).'
};

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'access-control-allow-origin': ok, 'access-control-allow-methods': 'POST,GET,OPTIONS', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
}

function parseJSON(text) {
  try { return JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()); }
  catch { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m[0]); } catch { return { reply: text.slice(0, 500), state: 'unknown', objection: 'unknown', rigor_resolved: false }; } }
}

async function requesty(env, model, system, messages, maxTokens) {
  const res = await fetch(REQUESTY_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.REQUESTY_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }].concat(messages) })
  });
  const d = await res.json();
  if (!res.ok || d.error) throw new Error((d.error && d.error.message) || ('router ' + res.status));
  return parseJSON(d.choices[0].message.content);
}

export default {
  async fetch(req, env) {
    const h = cors(req.headers.get('origin') || '');
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response(JSON.stringify({ ok: true, chat: CHAT_MODEL, email: EMAIL_MODEL }), { headers: h });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: h });
    let body;
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'bad json' }), { status: 400, headers: h }); }

    try {
      if (url.pathname === '/chat') {
        const msgs = (body.messages || []).slice(-2 * MAX_TURNS).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) }));
        const rag = typeof body.rag === 'string' ? body.rag.slice(0, 6000) : '';
        const turn = body.message
          ? String(body.message).slice(0, 2000)
          : `[PROACTIVE GREETING — no user message yet. Trigger: ${body.trigger}. ${TRIGGER_MOVES[body.trigger] || ''} Write your opening message now.]`;
        msgs.push({ role: 'user', content: turn });
        const out = await requesty(env, CHAT_MODEL, SYSTEM + rag, msgs, 700);
        return new Response(JSON.stringify(out), { headers: h });
      }
      if (url.pathname === '/email') {
        const engaged = body.mode === 'engaged';
        const rag = typeof body.rag === 'string' ? body.rag.slice(0, 6000) : '';
        const ctx = engaged
          ? `MODE: ENGAGED. Conversation:\n${(body.messages || []).map(m => m.role + ': ' + m.content).join('\n').slice(0, 8000)}\nState: ${body.state}; objection: ${body.objection}.\nWrite the recovery email as a CONTINUATION of this conversation. Subject references her actual objection; body answers it; invite reply.`
          : `MODE: NON-ENGAGED — she never talked to you. Signals: ${JSON.stringify(body.signals || {}).slice(0, 1000)}.\nWrite a personal email grounded in her signals, INVITING her to interact with the advisor to get answers and complete the purchase. Never a template.`;
        const sys = SYSTEM.replace('OUTPUT — ONLY a JSON object, no fences:', 'You are writing a recovery EMAIL (same identity, AI disclosure in the signature, verified facts only, no invented discounts, 120-180 words). OUTPUT — ONLY a JSON object:')
          .replace(/\{"reply".*$/s, '{"subject":"<subject>","body":"<plain-text email signed as the advisor with AI disclosure>"}') + rag;
        let em = await requesty(env, EMAIL_MODEL, sys, [{ role: 'user', content: ctx }], 1100);
        if (!em || !em.body) em = { subject: (em && em.subject) || 'About the certification you were considering', body: (em && em.reply) || 'Hi — it\'s the FHEA program advisor (an AI assistant). Your cart is saved; reply with any question and I\'ll answer it, with a human colleague one message away.' };
        return new Response(JSON.stringify(em), { headers: h });
      }
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: h });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: h });
    }
  }
};
