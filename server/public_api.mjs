// Stateless public endpoints (/chat, /email) — same request/response shape as the Cloudflare
// worker, so demo-brain.js can point DEFAULT_API at either. Runs on the local sandbox server
// behind a free quick tunnel for the demo phase; retire when the CF worker deploys.
// Brain: Requesty (haiku chat / sonnet emails) + FULL-corpus RAG (kb/index.json, 1509 chunks).
import { retrieve } from '../kb/retrieve.mjs';

const REQUESTY_URL = 'https://router.requesty.ai/v1/chat/completions';
const CHAT_MODEL = 'anthropic/claude-haiku-4-5';
const EMAIL_MODEL = 'anthropic/claude-sonnet-5';
const MAX_TURNS = 30;
const requestyKey = process.env.REQUESTY_API_KEY || '';

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
- Answer ONLY from the verified facts below plus any RETRIEVED COURSE MATERIAL. Not covered (state prescribing authority, employer reimbursement, medical advice)? Say so and offer the human colleague. NEVER guess.
- RETRIEVED COURSE MATERIAL is for proving depth and answering "does it cover X" — describe what the course teaches; never give clinical advice or reproduce protocols/dosing to the visitor.
- NEVER invent discounts. You may offer: the module outline, the employer-justification one-pager, Affirm info (illustrative only), a human colleague.
- OBJECTION-SEQUENCED SELLING: if decision state is clinically_curious and rigor is unresolved, do NOT bring up price yourself (exceptions: she asks price directly — answer in ONE short sentence then return to the open objection; or price_dwell / cart_* triggers where price IS the topic).
- rigor_resolved becomes true ONLY after she signals the depth answer landed. ALWAYS end with exactly one low-friction next step toward the sale.

STYLE (strict, American): everyday American English, short and punchy sentences.
- NEVER use em-dashes or en-dashes anywhere. Use commas, periods, or hyphens instead. Number ranges use a hyphen (3-6 months).
- Keep every reply to 2-3 short lines total.
- Giving 2 or more facts? You MUST format them as hyphen bullets, one per line, each under 15 words. Never chain facts with commas into one long sentence.

EXAMPLE of the required multi-fact format:
"Short direct answer first.
- ~60M chronically ill U.S. adults are seeking functional medicine
- NPs never got this training in school
- Average provider earnings: $221,000
Want the module outline?"

ANSWER-FIRST RULE (highest priority): when she asks a question — what/why/how/does it/is it — give the substantive answer IMMEDIATELY in your first sentence, with concrete facts. NEVER answer a question with a question. NEVER say "let me ask you back" or make her qualify herself (role, practice, goals) before she gets the answer. Broad questions ("why does this matter?") get the concrete case: patients are asking about functional medicine (~60M chronically ill U.S. adults seek it), NPs were never taught it in school, and providers who add it report strong earnings (avg $221,000) — THEN one short follow-up at most.
If she opens with just a greeting, do not ask an open "what brings you here" — offer the most common concrete starting point: how clinically deep the program goes.


HUMAN EXPERT: a human expert is part of your sequence, not a failure mode. If she asks for a human, or asks something outside the verified facts twice, set escalate=true and tell her a named expert will follow up (do not invent the expert's name).

VERIFIED FACTS
${FACTS.map(f => '- ' + f).join('\n')}

OUTPUT — ONLY a JSON object, no fences:
{"answer":"<1 short sentence that directly answers her>","points":["<0-4 bullet facts, each under 15 words>"],"next_step":"<one short follow-up question or CTA toward the sale>","state":"<clinically_curious|price_focused|career_pivot|employer_funded|browsing|unknown>","objection":"<rigor|cost|time|value|applicability|none|unknown>","rigor_resolved":<bool>,"buying_signal":<bool>,"escalate":<bool>}`;

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
function parseJSON(text) {
  try { return JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()); }
  catch { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m[0]); } catch { return { reply: text.slice(0, 500), state: 'unknown', objection: 'unknown', rigor_resolved: false }; } }
}

async function requesty(model, system, messages, maxTokens) {
  const res = await fetch(REQUESTY_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + requestyKey, 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }].concat(messages) })
  });
  const d = await res.json();
  if (!res.ok || d.error) throw new Error((d.error && d.error.message) || ('router ' + res.status));
  return parseJSON(d.choices[0].message.content);
}

function fullRag(query) {
  const hits = retrieve(String(query || ''), 4);
  if (!hits.length) return '';
  return '\n\nRETRIEVED COURSE MATERIAL (excerpts from the actual course, private source):\n'
    + hits.map(h => `[${h.doc}] ${h.text.slice(0, 700)}`).join('\n---\n');
}

export const publicApiReady = () => !!requestyKey;

export async function publicChat(body) {
  const msgs = (body.messages || []).slice(-2 * MAX_TURNS).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) }));
  const turn = body.message
    ? String(body.message).slice(0, 2000)
    : `[PROACTIVE GREETING — no user message yet. Trigger: ${body.trigger}. ${TRIGGER_MOVES[body.trigger] || ''} Write your opening message now.]`;
  msgs.push({ role: 'user', content: turn });
  const rag = body.message ? fullRag(body.message) : '';
  const out = await requesty(CHAT_MODEL, SYSTEM + rag, msgs, 700);
  composeReply(out);
  if (out && out.reply) out.reply = deDash(out.reply);
  return out;
}

export async function publicEmail(body) {
  const engaged = body.mode === 'engaged';
  const ctx = engaged
    ? `MODE: ENGAGED. Conversation:\n${(body.messages || []).map(m => m.role + ': ' + m.content).join('\n').slice(0, 8000)}\nState: ${body.state}; objection: ${body.objection}.\nWrite the recovery email as a CONTINUATION of this conversation. Subject references her actual objection; body answers it; invite reply.`
    : `MODE: NON-ENGAGED — she never talked to you. Signals: ${JSON.stringify(body.signals || {}).slice(0, 1000)}.\nWrite a personal email grounded in her signals, INVITING her to interact with the advisor to get answers and complete the purchase. Never a template.`;
  const ragQ = engaged ? (body.messages || []).map(m => m.content).join(' ').slice(-1200) : JSON.stringify(body.signals || {});
  const sys = SYSTEM.replace('OUTPUT — ONLY a JSON object, no fences:', 'You are writing a recovery EMAIL (same identity, AI disclosure in the signature, verified facts only, no invented discounts, 120-180 words). OUTPUT — ONLY a JSON object:')
    .replace(/\{"answer".*$/s, '{"subject":"<subject>","body":"<plain-text email signed as the advisor with AI disclosure>"}') + fullRag(ragQ);
  let em = await requesty(EMAIL_MODEL, sys, [{ role: 'user', content: ctx }], 1100);
  if (!em || !em.body) em = { subject: (em && em.subject) || 'About the certification you were considering', body: (em && em.reply) || "Hi — it's the FHEA program advisor (an AI assistant). Your cart is saved; reply with any question and I'll answer it, with a human colleague one message away." };
  if (!/\bAI\b/i.test(em.body)) em.body += '\n\n- FHEA Program Advisor (AI assistant, a human colleague is one message away)';
  em.subject = deDash(em.subject); em.body = deDash(em.body);
  return em;
}
