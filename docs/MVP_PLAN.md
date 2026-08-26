# MVP Build Plan — FM Program Advisor

_Approved 2026-08-26. Goal: a working, showable MVP in ~2 weeks — demo-first so the showcase never waits on IT or data access._

## Strategy: two tracks

**Track A — Demo MVP (zero external dependencies, starts today).** Everything runs on public info + synthetic contacts. This is the showcase.
**Track B — Production wiring (runs in parallel, gated on access).** HubSpot, course transcripts, WordPress snippet. This is P1 go-live.

The trick: the same codebase serves both — Track A stubs the connectors Track B fills in.

## MVP scope (what's in / out)

| In (MVP) | Out (post-MVP) |
|---|---|
| KB v1: scraped FM landing page facts + vision-doc seed + transcript ingestion pipeline | Auto-refresh diffing, NetSuite/BenchPrep sync |
| Advisor chat engine w/ persona, guardrails, decision-state tagging | Additional archetypes beyond Clinically Curious (workshop w/ Gail) |
| Recovery-email writer — both modes (engaged continuation + non-engaged invite) | Multi-email adaptive sequences |
| Widget with all 6 triggers on a demo replica of the FM page | Production WordPress deploy (Devin), elitenp.com |
| Approval queue (Airtable) + scoreboard v0 | Graduated autonomy, full analytics |
| HubSpot connector (contacts, properties, email send) behind a flag | SMS, checkout payment-stall hooks (Phase 3) |

## Architecture (MVP cut)

```
cert-sdr-agent/
├── worker/            # Cloudflare Worker (TypeScript + Hono) — ATLAS deploy pattern, CI on push to main
│   ├── src/chat.ts        # POST /chat — persona + KB grounding + decision-state classifier
│   ├── src/email.ts       # POST /email — recovery writer (engaged | non-engaged modes)
│   ├── src/guardrails.ts  # disclosure, length cap, price-timing by state, sourced-claims check
│   ├── src/memory.ts      # conversation store (Workers KV) keyed by contact
│   └── src/hubspot.ts     # contacts/properties/send — stubbed until access lands
├── widget/            # embeddable vanilla-JS chat widget + signal tracker (6 triggers)
├── kb/                # ingestion: scrape_landing.py, ingest_transcripts.py → kb/facts.json (fact + source + cert_id)
├── demo/              # private replica of the FM landing page with widget installed — the showcase stage
└── docs/              # this plan, vision, feedback, architecture
```

**Key MVP simplification:** one certification = small KB. `facts.json` rides along in the prompt — no vector DB yet. Course transcripts (95 hrs) get per-module summaries in-context + full-text lookup as a tool call. Claude model: Sonnet 5 for chat, with the option to A/B Opus for email copy quality.

**Guardrails are code, not prompt hopes:** disclosure line prepended to every first message; hard length cap enforced server-side; price-mention blocked while `state=clinically_curious && rigor_unresolved`; every factual claim must match a `facts.json` entry (post-generation check); dismiss flag kills proactive sends for the session.

## Day-by-day (working days from approval)

| Day | Deliverable |
|---|---|
| 1–2 | **KB v1**: scrape FM landing page → `facts.json` w/ sources; vision-doc facts seeded; transcript pipeline ready (ingests the moment Gail sends files) |
| 2–4 | **Advisor Worker**: `/chat` live on `*.workers.dev` — persona, Clinically Curious flow from the vision doc reproducible end-to-end |
| 4–5 | **Email writer**: both modes; input = contact signals (CSV of synthetic abandoners for demo; HubSpot list later); output → Airtable approval queue |
| 5–7 | **Widget + demo page**: all 6 triggers firing on the replica page (45s+60% scroll, price dwell, FAQ ×2, repeat visit, cookie-match sim, 90s idle); dismiss = silent |
| 7–8 | **Scoreboard v0** (conversations, states, objections, emails drafted/approved) + polish |
| 8–9 | **Showcase**: live demo + recorded walkthrough (script below) |
| 10+ | **Track B landing**: HubSpot private app wired (flag flipped), real transcripts ingested, holdout split defined, first 50 approval-gated emails → **P1 live** |

## The showcase (day 8–9)

Ten-minute demo for Gail/Yazir/Heather/Nader (then Molly/Prabhu):

1. **Open the replica FM page.** Scroll, linger on price 10s → advisor greets with the Affirm monthly figure, unprompted. Dismiss her → she stays silent (prove the rules).
2. **Reload as a new visitor**, act "Clinically Curious" — run the actual §3.3 conversation from the vision doc, live, and show her answering from KB facts with sources.
3. **Abandon a cart.** Show the agent-written recovery email land in the approval queue — subject line = the rigor objection from the chat.
4. **Show the non-engaged case**: a synthetic abandoner who never chatted gets the invite-to-chat email.
5. **Scoreboard**: decision states, objections captured, the marketing "survey effect."
6. Close with the go-live checklist: what flips this from demo to production (the asks below).

## Asks (needed for Track B — chase this week)

| Ask | Who | Blocks |
|---|---|---|
| Course content + lecture transcripts (any format) | Gail / LMS | Real KB depth (demo works without) |
| HubSpot access — private-app token ok (contacts, lists, single-send email) | Gail / IT | P1 go-live |
| Sample export of real FM abandoned-cart list (or field names) | Gail | Realistic email inputs |
| Persona name + voice sign-off | Heather / Yazir | Final copy (demo uses "FHEA program advisor") |
| Named escalation human | Yazir | Reply handling at go-live |
| Holdout split agreement | Gail / Nader | Provable lift |
| Devin intro (WordPress snippet) | Gail / IT | Phase 2 only — not MVP-blocking |

## Definition of "MVP live" (P1 production)

Agent-written recovery + invite emails flowing to **real FM/FHEA abandoners** through HubSpot, every email approval-gated in Airtable, holdout group intact, scoreboard tracking vs the 8% baseline. Widget stays demo-only until Devin deploys the snippet (P2).

## Risks

- **Transcript access slips** → demo unaffected; P1 emails ship on landing-page + vision facts and get deeper when transcripts land.
- **HubSpot single-send/transactional email needs a specific subscription tier** → verify early; fallback = drafts pushed for manual send day 1.
- **Replica-page demo mistaken for prod** → watermark it "DEMO — internal."
- **Persona name stalls** → ship demo as "FHEA program advisor" (vision doc's own wording).
