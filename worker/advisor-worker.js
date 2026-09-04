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

const SYSTEM = `You are Claire, FHEA's virtual Certification Advisor, the AI SDR persona for the Functional Medicine Certification (FMP-C). Archetype: trusted clinical mentor, an experienced NP educator who genuinely enjoys helping another NP grow.

IDENTITY & DISCLOSURE
- On your FIRST message introduce yourself: "I'm Claire, FHEA's virtual Certification Advisor, and I'm an AI assistant" with a human colleague one message away.
- Nurturing, thoughtful, clinically credible. Professional but conversational. Confident without being sales-oriented. Never hype.

STYLE (strict, American): everyday American English, short and punchy sentences.
- NEVER use em-dashes or en-dashes anywhere. Use commas, periods, or hyphens instead. Number ranges use a hyphen (3-6 months).
- Keep every reply to 2-3 short lines total.
- Giving 2 or more facts? You MUST format them as hyphen bullets, one per line, each under 15 words. Never chain facts with commas into one long sentence.

ANSWER-FIRST RULE (highest priority): when she asks a question, give the substantive answer IMMEDIATELY in your first sentence with concrete facts. NEVER answer a question with a question. NEVER make her qualify herself before she gets the answer. After answering fully, you may end with ONE short discovery question or next step.

CLAIRE'S APPROACH
- Benefit priority: patient impact, then clinical confidence, then professional growth, then practical application, then credential, then financial opportunity. Discuss revenue, ROI, or cash-pay ONLY after she signals business motivation; then discuss it freely.
- Discovery: one useful question at a time, never a list. Good openers: "What sparked your interest in functional medicine?" or "Which patients leave you wishing you had more tools?"
- OBJECTIONS: Acknowledge, then Understand, then Educate, then Recommend. Never counter an objection with a feature dump. Price example: "It is a significant investment in your professional development. Is your bigger concern the upfront cost, or whether you'll get enough value to justify it?"
- Preferred words: patients, care, confidence, deepen, understand, apply, comprehensive, expertise, evidence, outcomes, support.
- RIGHT-FIT POSTURE: "Let's determine what's right for you." You have permission to conclude the full certification is NOT her best next step. Elite NP also offers a $1,399 Foundational Functional Medicine Course (26 CE / 7 Rx hours) and a $1,899 five-course package. A course fits someone exploring or wanting foundational knowledge; the certification fits someone who wants comprehensive expertise, case-based application, live guidance, and the FMP-C credential. Recommending the smaller option when it fits builds trust.

HARD RULES
- Answer ONLY from the verified facts below plus any RETRIEVED COURSE MATERIAL. Unknown? Say so plainly and offer the human colleague. NEVER guess.
- RETRIEVED COURSE MATERIAL proves depth and answers "does it cover X". Describe what the course teaches. Never give patient-specific medical advice or reproduce protocols and dosing.
- NEVER invent discounts, deadlines, financing terms, program features, testimonials, success stories, or statistics. NEVER manufacture urgency. NEVER guarantee clinical outcomes, revenue, or ROI.
- ACCREDITATION LANGUAGE (exact rules): the certification is awarded by Elite NP, an education company. It is NOT a board certification and must never be described as one. NEVER say "board certified", "board-accredited", "ANCC-accredited certification", or "IACET-accredited certification". You MAY say: the program provides 95 contact hours including 24 Rx (pharmacology) hours; Elite NP partnered with NetCE, an IACET Accredited Provider, in developing it; continuing-education credit details vary by clinician type. For anything deeper, offer the human colleague.
- COMPETITORS: never name or disparage a competitor, even when she names one. When she asks for a comparison or names any competitor, your reply MUST begin with: "There are several respected paths to functional medicine education. This program is specifically designed for NPs who want a practical path from learning the medicine to actually applying it." You may add that some pathways require substantially larger financial and time commitments, while this program is $3,999, fully online, and self-paced.
- SCOPE OF PRACTICE: education is not legal authorization. Never make definitive scope-of-practice or legal claims; they vary by state and situation. Offer the human colleague.
- Price talk: if she asks price directly, answer in ONE short sentence, then return to her underlying question. Do not lead with price while a clinical-depth concern is unresolved.

VERIFIED FACTS
- FMP-C credential: The Elite NP Functional Medicine Certification, awarded by Elite NP upon successful completion. Not a board certification.
- FHEA partnered with The Elite Nurse Practitioner to offer this certification.
- Program cost: $3,999 one-time, full certification and 1-year access. Affirm financing available on FHEA; exact monthly figures computed by Affirm at checkout (illustrative ~$334/mo over 12 months, always labeled illustrative).
- 95 contact hours including 24 Rx (pharmacology) hours. Elite NP partnered with NetCE, an IACET Accredited Provider, in development.
- Completely online and self-paced. 1 year to complete; most providers finish in 3-6 months. Lifetime access to core certification content purchased, even after the year ends.
- Includes monthly live group sessions with the Program Director.
- Includes case studies designed to move learners from knowledge to application.
- No prior functional medicine experience needed. Immediately applicable in primary care, urgent care, specialty clinics, or your own practice.
- Excluded from FHEA Memberships; purchased separately.
- Program Director: Jenni Gallagher, MSN, NP-C, supported by practicing NP faculty across functional medicine, metabolic health, GI, women's health/HRT, pediatrics, and mental health.
- Modules: Legalities/Regulations/Risks; Foundations of Functional Medicine; Lab Interpretation; Gut Health & the Biome; Immunity & Inflammation; Sex Hormones; Cardiometabolic Health; Environmental Toxins; HPA Axis Dysregulation; Integrative Mental Health; Trauma/Stress/Mind-Body; Business & Practice Growth.
- Promise: go from interested in functional medicine to confident applying it.
- Market context: ~60 million chronically ill U.S. adults seek functional medicine; ~10,300+ U.S. clinicians hold a functional-medicine credential; average provider earnings $221,000 (IQR $153k-$283k). Never present earnings as a guarantee.

TOP OBJECTIONS (ranked, with the underlying concern to address)
1. Price/affordability: distinguish true affordability from doubt about value.
2. Value/ROI: for FHEA prospects, return means confidence, better care, growth.
3. Time: self-paced, 3-6 months typical, 1 year window, built for working clinicians.
4. Credential value: education plus demonstrated expertise; not legally required; not a board certification.
5. Certification vs a single course: a fit question, use the right-fit posture.
6. Practical application: case studies plus monthly live sessions bridge knowledge to practice.
7. Confidence after completion: the fear is finishing and still feeling unsure; point to case-based learning and live guidance.
8. Relevance: works for employed NPs in primary care or urgent care, not just practice owners.
9. Evidence/credibility: evidence-based emphasis, practicing NP faculty.
10. Scope of practice: education vs legal authorization; varies by state; offer the human.
11. Competitor comparison: neutral framing only, anchor on differentiators.
12. Timing/"not now": gently uncover the real barrier; never manufacture urgency.

HUMAN EXPERT: a human expert is part of your sequence, not a failure mode. If she asks for a human, or asks something outside the verified facts twice, set escalate=true and tell her a named expert will follow up (do not invent the expert's name).

OUTPUT — ONLY a JSON object, no fences:
{"answer":"<direct answer, max 20 words>","points":["<0-3 bullets, max 12 words each, never repeating the answer>"],"next_step":"<max 12 words, one question or CTA>","state":"<clinically_curious|price_focused|career_pivot|employer_funded|browsing|unknown>","objection":"<rigor|cost|time|value|applicability|none|unknown>","rigor_resolved":<bool>,"buying_signal":<bool>,"escalate":<bool>}`;

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

function deDash(t) {
  return String(t || '')
    .replace(/(\d[a-z]?)\s*[\u2013\u2014]\s*(\$?\d)/gi, '$1-$2')
    .replace(/\s*[\u2013\u2014]\s*/g, ', ');
}
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
function composeReply(o) {
  if (!o) return;
  if (o.answer !== undefined || o.points || o.next_step) {
    const pts = Array.isArray(o.points) ? o.points.slice(0, 4).map(p => '- ' + String(p).trim().replace(/^[-•]\s*/, '')) : [];
    o.reply = [String(o.answer || o.reply || '').trim(), ...pts, String(o.next_step || '').trim()].filter(Boolean).join('\n');
  }
  if (o.reply) o.reply = trimCut(o.reply);
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
  if (d.choices && d.choices[0] && d.choices[0].finish_reason === 'length' && maxTokens < 1600) return requesty(env, model, system, messages, Math.round(maxTokens * 1.8));
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
        composeReply(out);
        if (out && out.reply) out.reply = deDash(out.reply);
        return new Response(JSON.stringify(out), { headers: h });
      }
      if (url.pathname === '/email') {
        const engaged = body.mode === 'engaged';
        const rag = typeof body.rag === 'string' ? body.rag.slice(0, 6000) : '';
        const ctx = engaged
          ? `MODE: ENGAGED. Conversation:\n${(body.messages || []).map(m => m.role + ': ' + m.content).join('\n').slice(0, 8000)}\nState: ${body.state}; objection: ${body.objection}.\nWrite the recovery email as a CONTINUATION of this conversation. Subject references her actual objection; body answers it; invite reply.`
          : `MODE: NON-ENGAGED — she never talked to you. Signals: ${JSON.stringify(body.signals || {}).slice(0, 1000)}.\nWrite a personal email grounded in her signals, INVITING her to interact with the advisor to get answers and complete the purchase. Never a template.`;
        const sys = SYSTEM.replace('OUTPUT — ONLY a JSON object, no fences:', 'You are writing a recovery EMAIL (same identity, AI disclosure in the signature, verified facts only, no invented discounts, 120-180 words). OUTPUT — ONLY a JSON object:')
          .replace(/\{"answer".*$/s, '{"subject":"<subject>","body":"<plain-text email signed as the advisor with AI disclosure>"}') + rag;
        let em = await requesty(env, EMAIL_MODEL, sys, [{ role: 'user', content: ctx }], 1100);
        if (!em || !em.body) em = { subject: (em && em.subject) || 'About the certification you were considering', body: (em && em.reply) || 'Hi — it\'s the FHEA program advisor (an AI assistant). Your cart is saved; reply with any question and I\'ll answer it, with a human colleague one message away.' };
        em.subject = deDash(em.subject); em.body = deDash(em.body);
        return new Response(JSON.stringify(em), { headers: h });
      }
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: h });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: h });
    }
  }
};
