# The Outcome — In Plain English

*This page explains the whole project in simple terms. No technical background needed. The product vision it's based on: [docs/VISION.md](docs/VISION.md) (Gail Applin, Aug 17, 2026). The deep technical version: [ARCHITECTURE.md](ARCHITECTURE.md).*

---

## 1. The Problem

We sell the **Functional Medicine Certification** — the most valuable single product in the FHEA catalog at **$3,999** — on fhea.com and elitenp.com.

A $3,999 clinical credential is a big, considered decision. The nurse practitioner reading that page is weighing a career change, a possible cash-pay practice, a year of evenings, and money that often comes out of a household budget. She has real questions:

- *"Is this actually accredited?"*
- *"Does it count toward my prescribing requirements?"*
- *"Will it teach me how to charge for this work?"*
- *"Will my employer reimburse it?"*

**And today, she has nowhere to ask them at the exact moment she's asking them.** So she leaves.

- **$2.8 million** of Functional Medicine certifications were left in abandoned carts in July — one product, one website, one month.
- Only **8 out of 100** cart abandoners come back and buy.
- The only follow-up is a generic "you left something in your cart" template — the same one everyone gets, answering none of her questions.

## 2. The Solution

**One AI program advisor with a name, a voice, and a memory — present at the three moments that decide the sale:**

**① On the page, when she hesitates.** The advisor doesn't pop up on everyone — that's how chat widgets get ignored. She watches for *evidence of being stuck*: lingering on the pricing section, opening the FAQ twice, coming back a second time this week, sitting idle mid-page. Then she opens with the exact thing that person needs — "Want me to walk you through how clinically deep this actually goes?" or the monthly Affirm payment figure, before she has to ask.

**② At the cart, when she stalls.** Added the certification but hovering over the exit button? Hunting for a coupon code? Payment page sitting idle? The advisor steps in once and removes the single specific blocker in thirty seconds — the Affirm monthly figure, or simply asking what outstanding question she has — or asks permission to follow up.

**③ In her inbox, after she leaves.** This is the part nobody else does: **the same advisor who had the conversation writes the follow-up email herself.** If she asked about clinical rigor, the subject line addresses rigor and the body answers it — hours, accreditation, faculty, module list. No generic template. And if she left without ever talking to the advisor, she still gets a personal email — inviting her to come ask her questions and finish the purchase. The emails stop the moment her question is resolved or she buys.

**Always honest:** she introduces herself as an AI assistant with a human colleague one message away. **Always grounded:** she has actually *read the course* — the modules and lecture transcripts feed her knowledge base — and she can only say things verified from it; she never invents an answer. **Always respectful:** one approach per visit; if dismissed, she goes quiet.

## 3. What It Is (and Isn't)

| It IS | It ISN'T |
|---|---|
| One advisor across page, cart, and email — with memory | Three disconnected automations |
| Triggered by evidence of hesitation | A pop-up that greets everyone on page load |
| Emails written per-person from her actual conversation | A generic abandoned-cart template |
| An honest, disclosed AI assistant | Something pretending to be human |
| Grounded in verified course facts only | A chatbot that makes things up |
| Starting with ONE product (Functional Medicine) on ONE site (fhea.com) | A big-bang launch |

## 4. How We'll Do It

**Phase 1 — The email writer** *(no website changes needed — ships first)*
First the agent reads the course — modules and transcripts — to build her knowledge base. Then she starts writing personalized recovery emails for FM cart abandoners through HubSpot, based on what each person viewed and where they stalled, inviting them to bring her their questions. Every email is human-reviewed before sending until the team signs off on autonomy. A comparison group stays on the old template so we can prove the difference.

**Phase 2 — The landing-page advisor**
The chat advisor goes live on the fhea.com Functional Medicine page with the hesitation triggers, answering questions from a knowledge base that updates itself when our course pages change. She captures leads and tags what's blocking each buyer.

**Phase 3 — Cart & checkout rescue**
Exit-intent, payment-stall, and coupon-hunt interventions at the moment of truth.

**Phase 4 — Close the loop & roll out**
Emails now continue the actual on-page conversations. Then: elitenp.com, then the other five certifications.

**Safety rails throughout:** AI disclosure in every greeting · human approval before autonomy · no clinical advice, no invented claims, no fake discounts · instant unsubscribe · never interrupts someone who's already buying.

## 5. What We Need to Start

| What | Who |
|---|---|
| Persona sign-off: her name, voice, and what she's allowed to promise | Heather / Yazir |
| Course facts confirmed as the knowledge base seed (hours, accreditation, modules, faculty, Affirm terms) | Gail |
| **Course content + lecture transcripts for the agent to read** (feeds the knowledge base) | Gail / LMS access |
| Content assets: module-by-module outline, employer-justification one-pager, success stories | Heather |
| HubSpot access (contacts, email, cookie identity) | Gail / IT |
| A way to put one small script on the fhea.com cert page (Phase 2) | IT — Devin may be able to (it's a WordPress page) |
| A named human colleague for questions the AI can't answer | Yazir |
| Comparison-group agreement so results are provable | Gail / Nader |

## What We Need to Finish

Real student success stories (thinnest content today) · checkout-page event access for Phase 3 · Elite NP's carts flowing into HubSpot (today they're stuck in Teachable) for Phase 4 · reconciled opportunity numbers for the final business case.

## 6. The End Outcome — Money

**Goal: move abandoned-cart conversion from 8% to 10–12%.** On July's volume:

```
Functional Medicine carts (July, fhea.com):   $2.8 million
Today we recover 8%:                          ~$224,000
At 10% we'd recover:                          ~$280,000   →  +$56,000/month
At 12% we'd recover:                          ~$336,000   →  +$112,000/month
```

**≈ $670K – $1.3M per year of extra revenue from one certification on one website.** And this vision adds two revenue lines the July plan didn't have:

1. **Saves before the abandonment** — the page advisor and cart rescue convert people who today never even become "abandoned carts" (they're invisible in the 8% math).
2. **A lead engine** — hesitating visitors who weren't ready to buy become captured, tagged leads ("Clinically Curious — objection: rigor") entering nurture paths that speak to their actual objection.

Then it scales: elitenp.com, five more certifications, and a growing map of exactly what stops buyers — which sharpens every page, email, and ad we run.

**What it costs:** build time, AI usage (a few hundred dollars/month), HubSpot we already own. No new hires — versus $70K+/year per inside sales rep, per rep.

**How we'll know it worked:** advisor-assisted buyers vs. the comparison group, read out ~30 days after each phase goes live. If it moves, scale. If not, we've learned precisely which objections a future human team must answer — either way, we stop guessing.

---

*Details: [docs/VISION.md](docs/VISION.md) (the vision) · [ARCHITECTURE.md](ARCHITECTURE.md) (the build) · [docs/TOUCHPOINTS.md](docs/TOUCHPOINTS.md) (exact behaviors) · [docs/BUSINESS_CASE.md](docs/BUSINESS_CASE.md) (the numbers).*
