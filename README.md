# Cert SDR Agent — AI SDR for Certifications

**AI-powered B2C sales agent that recovers abandoned carts and converts warm leads for Colibri healthcare certification products (FHEA + Elite NP).**

Unlike our B2B agents (ATLAS, KELLI, ROBBY) whose goal is booking meetings, this agent's Phase 1 goal is to **close the sale directly** via email + SMS — no humans in the sales loop.

## The Problem

- Certifications are high-ticket ($3,999 list) NP training products: **Functional Medicine, HRT, Dermatology, Women's Hormone** (~6 certs total across Fitzgerald/FHEA and Elite NP).
- **$2.8M in abandoned-cart opportunity for Functional Medicine alone in July 2026** (Matomo, FHEA).
- Current abandoned-cart conversion: **8%** (74 carts worth $295K → 6 conversions).
- Warm leads list: **~2,500 people, 1 conversion** from the current campaign.
- Today's follow-up is a generic "you left something in your cart + 10%" email. No signal-based, personalized, human-feeling outreach. No one answers buyer questions.

## The Solution

A certification-grounded AI SDR that:

1. **Reaches out like a human** — multi-touch email + SMS sequence (HubSpot native), storytelling from current state → future state, objection handling, strategic 10% discount placement.
2. **Answers questions** — replies are handled by a Claude agent grounded in an auto-refreshing knowledge base (landing pages, Heather's objection content, NetSuite/BenchPrep catalog). Zero hallucination: only verified product facts.
3. **Learns** — every objection and question captured feeds back into content strategy (survey effect Gail described).

**Scope order:** Functional Medicine on FHEA first → prove lift over 8% baseline → roll out to remaining certs → Elite NP (needs Teachable→HubSpot cart capture first).

## Success Metrics

| Metric | Baseline | Target |
|---|---|---|
| Abandoned cart conversion (FM/FHEA) | 8% | 10–12% |
| Warm lead conversion (2,500 list) | ~0.04% (1/2500) | TBD after baseline campaign ends |
| Revenue recovered | — | sized in business case |

## Key Documents

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — full system design
- [`docs/MEETING_NOTES.md`](docs/MEETING_NOTES.md) — distilled requirements from both discovery calls
- [`docs/SEQUENCE_SPEC.md`](docs/SEQUENCE_SPEC.md) — the 7-touch sequence design (Nader's spec)
- [`docs/BUSINESS_CASE.md`](docs/BUSINESS_CASE.md) — business case inputs and skeleton
- [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — what we're waiting on and unresolved decisions
- [`docs/transcripts/`](docs/transcripts/) — verbatim meeting transcripts (source of truth)
- [`docs/source/`](docs/source/) — original .docx meeting files

## Stakeholders

| Person | Role |
|---|---|
| Yazir Phelps | Executive sponsor (owns certifications P&L; PTO ~Aug 7–21) |
| Gail Applin | Project quarterback — internal data/access, AI-savvy, co-designs build |
| Heather Bartel | Content & messaging — owns objection-based email content per cert |
| Nader Rustom | Business case, GTM design, sequence strategy |
| Sam Chaudhary | Technical build (this repo) |
| Molly Swagler | Green light approver |
| Prabhu Inbarajan | Resource approval (Sam's allocation) |

## Timeline

- **~Jul 30:** data + educational assets from Gail/Heather (48h commitment from Jul 28 call)
- **By Aug 1:** Nader submits business case
- **Tue Aug 4:** kickoff meeting — starts the clock on a **2-week build sprint**
- **~Aug 18:** Phase 1 live for Functional Medicine / FHEA
