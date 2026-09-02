// Advisor engine — persona, KB grounding, guardrails, email writer.
// Zero deps. Claude via fetch; MOCK mode when no API key so demos never die.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { retrieve, indexInfo } from '../kb/retrieve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KB = JSON.parse(readFileSync(join(ROOT, 'kb', 'facts.json'), 'utf-8'));
const MODEL = process.env.ADVISOR_MODEL || 'claude-sonnet-5';
const anthropicKey = process.env.ANTHROPIC_API_KEY || ''; // env-var reference only — value never lives in this repo
export const MOCK = !anthropicKey || process.env.MOCK === '1';

const MAX_REPLY_CHARS = 900; // vision: hard cap — a wall of text reads as a pop-up, not a person
const DISCLOSURE = 'I am the FHEA program advisor and I am an AI assistant';

function kbBlock() {
  const lines = KB.facts.map(f => `- [${f.id}] ${f.fact}${f.caution ? ` (CAUTION: ${f.caution})` : ''}`);
  const tDir = join(ROOT, 'kb', 'transcripts');
  const transcripts = existsSync(tDir) ? readdirSync(tDir).filter(f => f.endsWith('.json')) : [];
  return lines.join('\n') + (transcripts.length ? `\n(Plus ${transcripts.length} ingested course transcript files.)` : '');
}

const TRIGGER_MOVES = {
  dwell_scroll: 'She has read 45+ seconds and scrolled past the curriculum without clicking. Offer the thing most people at that point ask about: how clinically deep the program actually goes.',
  price_dwell: 'She has been looking at the price block for 10+ seconds. Lead with total cost clarity and Affirm financing, unprompted. Price talk IS appropriate for this trigger.',
  faq_repeat: 'She opened the FAQ accordion twice or more. Answer the category she is opening directly instead of making her read.',
  repeat_visit: 'This is at least her second visit within 14 days. Acknowledge the return warmly and ask what is still open for her.',
  known_contact: 'She is a known contact (HubSpot cookie match — simulated in sandbox). Skip discovery and go straight to the open question.',
  idle: 'She has been idle mid-page for 90 seconds. Make one single low-friction offer, then be ready to go quiet.',
  cart_exit: 'CART RESCUE: exit intent on the cart page. She added a $3,999 certification and is about to leave. Name and remove the single most likely blocker in one short message — or ask what outstanding question she has.',
  cart_coupon: 'CART RESCUE: she is hunting for a coupon code. Reinforce full value and mention Affirm financing as the legitimate way to ease cost. Do NOT invent a discount.',
  cart_stall: 'CART RESCUE: the payment step has sat idle. Gently ask what outstanding question she has, or offer the Affirm monthly option (illustrative figure only).'
};

function systemPrompt() {
  return `You are the FHEA program advisor — the customer-facing persona of the Functional Medicine AI SDR for the ${KB.cert_name}.

IDENTITY & DISCLOSURE
- You are a warm, knowledgeable program advisor. On your FIRST message of a conversation you must say plainly that you are an AI assistant (e.g., "${DISCLOSURE}, so you can ask me anything about this certification without a sales call") and that a human colleague is one message away.
- Consistent voice: plain, concrete, peer-to-peer with a nurse practitioner. Never salesy, never hype.

HARD RULES
- SHORT messages. 2-5 sentences. Never a wall of text.
- Answer ONLY from the verified facts below. If asked something not covered (state prescribing authority, employer reimbursement, medical advice, competitor claims), say you don't have that verified and offer the human colleague. NEVER guess or invent.
- NEVER invent discounts or promise anything beyond: sending the module outline, sharing the employer-justification one-pager, Affirm financing info (illustrative only), or connecting a human colleague.
- OBJECTION-SEQUENCED SELLING: if the visitor's decision state is "clinically_curious" and rigor is not yet resolved, DO NOT mention price, cost, or financing — depth first, price only after rigor is resolved. (Exception: price_dwell and cart triggers, where price IS the topic.)
- One question max per message. End most messages with a low-friction next step.

VERIFIED FACTS (cite nothing beyond these)
${kbBlock()}

ESCALATION: ${KB.escalation}

OUTPUT FORMAT — respond with ONLY a JSON object, no markdown fences:
{"reply": "<your message to the NP>", "state": "<clinically_curious|price_focused|career_pivot|employer_funded|browsing|unknown>", "objection": "<rigor|cost|time|value|applicability|none|unknown>", "rigor_resolved": <true|false>, "buying_signal": <true|false>}`;
}

// ---------- guardrails (code, not prompt hopes) ----------
export function applyGuardrails(parsed, session, trigger) {
  const notes = [];
  let reply = (parsed.reply || '').trim();

  // 1. Disclosure on first agent message
  if ((session.messages.filter(m => m.role === 'assistant').length === 0) && !/\bAI\b|artificial intelligence/i.test(reply)) {
    reply = `Hi — ${DISCLOSURE}, so you can ask me anything without a sales call. ` + reply;
    notes.push('disclosure_injected');
  }
  // 2. Hard length cap at sentence boundary
  if (reply.length > MAX_REPLY_CHARS) {
    const cut = reply.slice(0, MAX_REPLY_CHARS);
    reply = cut.slice(0, Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! ')) + 1) || cut;
    notes.push('length_capped');
  }
  // 3. Price gating for unresolved Clinically Curious (except price/cart triggers)
  const priceOK = ['price_dwell', 'cart_exit', 'cart_coupon', 'cart_stall'].includes(trigger) || session.rigor_resolved;
  if (parsed.state === 'clinically_curious' && !parsed.rigor_resolved && !priceOK && /\$\s?[\d,]+|price|cost|affirm|financing/i.test(reply)) {
    reply = reply.split(/(?<=[.!?])\s+/).filter(s => !/\$\s?[\d,]+|price|cost|affirm|financing/i.test(s)).join(' ').trim();
    notes.push('price_stripped_rigor_unresolved');
  }
  // 4. Sourced-claims check: every number in the reply must exist in the KB (or the conversation)
  const kbText = JSON.stringify(KB);
  const nums = reply.match(/\d[\d,]*(?:\.\d+)?%?/g) || [];
  const unverified = nums.filter(n => !kbText.includes(n.replace(/[%,]/g, m => m === '%' ? '' : ','))
    && !kbText.includes(n.replace(/,/g, '')) && !['1', '2', '3'].includes(n));
  if (unverified.length) notes.push(`claims_flag:${unverified.join('|')}`);

  return { reply, notes };
}

// ---------- mock brain (no API key — demo never dies) ----------
function mockReply(session, trigger, userMsg) {
  const first = session.messages.filter(m => m.role === 'assistant').length === 0;
  const m = (userMsg || '').toLowerCase();
  if (first && !userMsg) {
    const opens = {
      price_dwell: `Hi — ${DISCLOSURE}, so you can ask me anything without a sales call. Since you're looking at cost: it's $3,999 one-time with a full year of access, and Affirm financing is available — roughly $334/month over 12 months as an illustration. Want me to break down exactly what that includes?`,
      cart_exit: `Before you go — ${DISCLOSURE}. Totally understand wanting to think a $3,999 decision over. What's the one outstanding question I can answer for you right now?`,
      cart_coupon: `${DISCLOSURE} — quick honest note: there's no coupon floating around, but Affirm financing on FHEA can spread the $3,999 out monthly. Meanwhile, is cost the only thing giving you pause?`,
      cart_stall: `Still here if you need me — ${DISCLOSURE}. Is there an outstanding question holding you back, or would the Affirm monthly option help?`
    };
    return { reply: opens[trigger] || `Hi — ${DISCLOSURE}, so you can ask me anything about this certification without a sales call. Most NPs at this point in the page are trying to work out how clinically deep it actually goes. Want me to walk you through the lab interpretation and prescribing content?`, state: trigger === 'price_dwell' ? 'price_focused' : 'clinically_curious', objection: trigger === 'price_dwell' ? 'cost' : 'rigor', rigor_resolved: false, buying_signal: false };
  }
  if (/deep|rigor|serious|vibes|supplement|clinical|evidence/.test(m)) return { reply: `That's a fair filter. The program is 95 contact hours, IACET accredited, and 24 of those hours are pharmacology — so it counts toward Rx requirements. There are full modules on lab interpretation, cardiometabolic health, HPA axis dysregulation, immunity and inflammation, and gut health, led by Jenni Gallagher, MSN, NP-C with practicing NP subject-matter experts. Want the module-by-module outline to compare side by side?`, state: 'clinically_curious', objection: 'rigor', rigor_resolved: true, buying_signal: false };
  if (/how long|time|finish|pace/.test(m)) return { reply: `It's fully online and self-paced with a year of access — most providers finish in 3–6 months. And you keep lifetime access to the core content you purchased even after the year ends. What's your email and I'll send the outline now?`, state: session.state || 'clinically_curious', objection: 'time', rigor_resolved: session.rigor_resolved || false, buying_signal: false };
  if (/@/.test(m)) return { reply: `Perfect, sending the module-by-module outline now. I'll also flag the two modules people find most demanding so you can plan around them. Anything else on your mind while you have me?`, state: session.state || 'clinically_curious', objection: session.objection || 'none', rigor_resolved: true, buying_signal: true };
  if (/price|cost|afford|worth/.test(m)) return { reply: `It's $3,999 one-time — that includes all 95 contact hours, the exam, and a year of access (with lifetime access to the core content after). Affirm financing is available if monthly works better — illustratively around $334/month over 12 months. Would a breakdown of what's included help?`, state: 'price_focused', objection: 'cost', rigor_resolved: session.rigor_resolved || false, buying_signal: false };
  return { reply: `Good question — here's what I can verify: it's a 95-contact-hour, IACET-accredited program with 24 Rx hours, fully online and self-paced. If your question is about something I don't have verified — like your state's prescribing rules or employer reimbursement — I'd rather connect you with my human colleague than guess. What would help most?`, state: session.state || 'unknown', objection: session.objection || 'unknown', rigor_resolved: session.rigor_resolved || false, buying_signal: false };
}

async function callClaude(system, messages, maxTokens = 700) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages })
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.content.map(b => b.text || '').join('');
}

function parseJSON(text, fallbackReply) {
  try { return JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()); }
  catch { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m[0]); } catch { return { reply: fallbackReply || text.slice(0, 500), state: 'unknown', objection: 'unknown', rigor_resolved: false, buying_signal: false }; } }
}

// ---------- public: chat turn ----------
export async function chatTurn(session, { trigger, message }) {
  let parsed;
  if (MOCK) {
    parsed = mockReply(session, trigger, message);
  } else {
    const convo = session.messages.map(m => ({ role: m.role, content: m.content }));
    const turnCtx = message
      ? message
      : `[PROACTIVE GREETING — no user message yet. Trigger: ${trigger}. ${TRIGGER_MOVES[trigger] || ''} Write your opening message now.]`;
    convo.push({ role: 'user', content: turnCtx });
    // Full-corpus RAG (private index over the 39 course docs) — local server only
    let rag = '';
    if (message) {
      const hits = retrieve(message, 4);
      if (hits.length) rag = '\n\nRETRIEVED COURSE MATERIAL (verbatim excerpts from the actual course, PRIVATE — use to prove depth and answer "does it cover X"; describe what the course teaches, do NOT give clinical advice or reproduce protocols/dosing to the visitor):\n'
        + hits.map(h => `[${h.doc}] ${h.text.slice(0, 700)}`).join('\n---\n');
    }
    parsed = parseJSON(await callClaude(systemPrompt() + rag, convo));
  }
  const { reply, notes } = applyGuardrails(parsed, session, trigger);
  if (message) session.messages.push({ role: 'user', content: message });
  session.messages.push({ role: 'assistant', content: reply });
  session.state = parsed.state || session.state;
  session.objection = parsed.objection && parsed.objection !== 'unknown' ? parsed.objection : session.objection;
  session.rigor_resolved = parsed.rigor_resolved || session.rigor_resolved || false;
  session.buying_signal = parsed.buying_signal || session.buying_signal || false;
  session.guardrail_notes = [...(session.guardrail_notes || []), ...notes];
  const emailMatch = (message || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) session.email = emailMatch[0];
  return { reply, state: session.state, objection: session.objection, rigor_resolved: session.rigor_resolved, guardrails: notes };
}

// ---------- public: recovery email (both modes) ----------
export async function writeRecoveryEmail(contact, session) {
  const engaged = session && session.messages && session.messages.length > 0;
  const mode = engaged ? 'engaged' : 'non_engaged';
  let parsed;
  if (MOCK) {
    parsed = engaged
      ? { subject: `The ${session.objection === 'rigor' ? 'clinical depth' : session.objection || 'question'} you asked about — answered`, body: `Hi ${contact.name || 'there'},\n\nIt's the FHEA program advisor (still an AI assistant, still no sales call). When we talked you wanted to know how clinically deep the Functional Medicine Certification really goes — fair question for a $3,999 decision.\n\nThe short answer: 95 IACET-accredited contact hours, 24 of them pharmacology (they count toward Rx requirements), with full modules on lab interpretation, gut health, HPA axis dysregulation, and cardiometabolic health — built and taught by practicing NPs under Jenni Gallagher, MSN, NP-C.\n\nYour cart is saved. If one more question stands between you and a decision, just reply — I answer in minutes, and a human colleague is one message away.\n\n— FHEA Program Advisor (AI)` }
      : { subject: `Your Functional Medicine cart is saved — and your questions have a home`, body: `Hi ${contact.name || 'there'},\n\nYou left the Functional Medicine Certification in your cart — most NPs who do are weighing a real question: is it rigorous enough, is $3,999 justified, is there time for 95 hours?\n\nI'm the FHEA program advisor — an AI assistant who has read every module and can answer those questions in minutes, no sales call, with a human colleague one message away.\n\nReply to this email with whatever's on your mind, or come back to the page and ask me there. Your cart (and 1-year access + lifetime core-content access) will be waiting.\n\n— FHEA Program Advisor (AI)` };
  } else {
    const ctx = engaged
      ? `MODE: ENGAGED — she talked to you. Conversation:\n${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nDecision state: ${session.state}; primary objection: ${session.objection}; rigor_resolved: ${session.rigor_resolved}.\nWrite the recovery email as a CONTINUATION of this exact conversation. Subject line must reference her actual objection. Body answers it, then invites reply.`
      : `MODE: NON-ENGAGED — she never talked to you (Aug 20 feedback case). Signals: ${JSON.stringify(contact.signals || {})}.\nWrite a personal email grounded in what she viewed and where she stalled, INVITING her to interact with the advisor (reply to this email or ask on the page) to get her questions answered and complete the purchase. Not a template — reference her actual signals.`;
    const sys = systemPrompt().replace('OUTPUT FORMAT — respond with ONLY a JSON object, no markdown fences:', 'You are now writing a recovery EMAIL, not a chat message. Same identity, same rules (AI disclosure in the signature, verified facts only, no invented discounts). 120-180 words. OUTPUT FORMAT — respond with ONLY a JSON object:').replace(/\{"reply".*\}$/s, '{"subject": "<subject referencing her actual objection or signals>", "body": "<the email body, plain text, signed as the advisor with AI disclosure>"}');
    parsed = parseJSON(await callClaude(sys, [{ role: 'user', content: ctx }], 900));
  }
  return {
    id: `em_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    mode, contact: { name: contact.name || '', email: contact.email || '' },
    subject: parsed.subject, body: parsed.body,
    grounded_in: engaged ? { state: session.state, objection: session.objection, turns: session.messages.length } : { signals: contact.signals || {} },
    status: 'pending', created: new Date().toISOString()
  };
}

export function kbSummary() {
  return { cert: KB.cert_name, facts: KB.facts.length, sources: KB.sources, mock_mode: MOCK, model: MOCK ? 'mock' : MODEL, corpus_index: indexInfo() };
}
