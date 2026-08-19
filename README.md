# FM Program Advisor — AI SDR for the Functional Medicine Certification

**One AI agent, one identity, three touchpoints: a program advisor that meets nurse practitioners on the landing page, rescues stalling carts at checkout, and writes the recovery email herself — grounded in the conversation she actually had.**

Product vision by Gail Applin (Sr. Director of Digital Marketing, Colibri Healthcare), Aug 17 2026 — [`docs/VISION.md`](docs/VISION.md). Discovery groundwork from the Jul 22 (Yazir/Nader) and Jul 28 (Gail/Heather/Nader) calls — [`docs/MEETING_NOTES.md`](docs/MEETING_NOTES.md).

## The Product

**Functional Medicine Certification (FMP-C)** by Elite NP — the highest-value single SKU in the FHEA catalog.
Sold on **fhea.com** and **elitenp.com** · **$3,999 one-time** · Affirm financing (FHEA only) · 95 contact hours, IACET accredited, 24 pharmacology hours · led by Jenni Gallagher, MSN, NP-C.

## The Problem

A $3,999 clinical credential is a considered purchase. The NP reading that page is weighing a career pivot, a cash-pay practice, a year of evenings, and household money. She has real questions — accreditation, state prescribing authority, whether the business module teaches her to charge for this work, employer reimbursement — **and today she has nowhere to ask them at the moment she is asking them.**

The numbers: **$2.8M in July abandoned-cart opportunity for Functional Medicine on FHEA alone** (Matomo), only **8%** of cart abandoners convert, and the follow-up is a generic "you left something in your cart" template.

## The Solution — one agent, three touchpoints

| # | Touchpoint | Moment | Job to be done |
|---|---|---|---|
| 1 | **Landing page advisor** | Behavior signals hesitation (not disinterest) on the cert page | Answer the unasked question, classify decision state, capture identity, move her to cart |
| 2 | **Cart & checkout rescue** | Exit intent, payment stall, coupon hunting after add-to-cart | Name and remove the single blocker in 30 seconds, or capture permission to follow up |
| 3 | **Agent-written recovery email** | After abandonment, via HubSpot | Continue the actual conversation — subject line references her real objection, body answers it, sequence stops when resolved |

Touchpoint 3 is what makes this different from a chatbot: **the agent that had the conversation writes the email.** No templates.

She has a name (TBD), a consistent voice, memory across touchpoints, and a defined scope of authority. To the customer she is a *program advisor* who says plainly she is an AI assistant with a human colleague one message away.

## Key Design Rules (from the vision)

- **Greet on evidence of hesitation, never on page load** — 8 behavioral triggers defined in [`docs/VISION.md §3.1`](docs/VISION.md)
- **One proactive attempt per session**; dismissed = silent for the session
- **Never proactive on checkout**; never greet members who already own the cert
- **Hard cap on message length** — a wall of text reads as a pop-up, not a person
- **Objection-sequenced selling** — e.g. never mention price to a "Clinically Curious" NP until rigor is resolved
- **Zero hallucination** — every product claim traces to a verified KB fact

## Key Documents

- [`docs/VISION.md`](docs/VISION.md) — **the product vision (source of truth)**
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — technical system design
- [`docs/TOUCHPOINTS.md`](docs/TOUCHPOINTS.md) — behavior spec per touchpoint (triggers, rescue plays, email rules)
- [`docs/BUSINESS_CASE.md`](docs/BUSINESS_CASE.md) — the money
- [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — decisions pending
- [`docs/MEETING_NOTES.md`](docs/MEETING_NOTES.md) + [`docs/transcripts/`](docs/transcripts/) — July discovery record
- [`docs/source/`](docs/source/) — original .docx files (both transcripts + the vision doc)

## Stakeholders

| Person | Role |
|---|---|
| Gail Applin | Product owner — authored the vision, Sr. Director of Digital Marketing |
| Yazir Phelps | Executive sponsor (certifications P&L) |
| Heather Bartel | Content & messaging — objection content, outline assets, one-pagers |
| Nader Rustom | Business case & GTM |
| Sam Chaudhary | Technical build (this repo) |
| Molly Swagler / Prabhu | Green light / resource approval |

## Success Metrics

| Metric | Baseline | Target |
|---|---|---|
| Abandoned-cart conversion (FM/FHEA) | 8% | 10–12% |
| Landing-page → cart rate for advisor conversations | — | benchmark in pilot |
| Lead capture from hesitating visitors | ~0 today | new pipeline |
| Objection dataset for marketing | none | tagged decision states + objections per contact |
