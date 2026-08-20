# FM Program Advisor (Cert SDR Agent) — Claude Code Context

Read this every session. **Source of truth: `docs/VISION.md`** (Gail Applin, Aug 17 2026) **as amended by `docs/FEEDBACK-2026-08-20.md`** — one agent, one identity, three touchpoints. Technical design: `ARCHITECTURE.md` (Rev 2.1). Behavior spec: `docs/TOUCHPOINTS.md`. July discovery record: `docs/MEETING_NOTES.md` + `docs/transcripts/`.

## What this is
A named AI **program advisor** for the **Functional Medicine Certification (FMP-C)** — $3,999, FHEA's highest-value SKU, sold on fhea.com + elitenp.com. Three touchpoints: (1) landing-page advisor triggered by hesitation signals, (2) cart/checkout rescue, (3) **agent-written recovery emails that continue the actual conversation** (never templates). Phase order: P1 email writer → P2 page advisor → P3 cart rescue → P4 full loop + rollout.

## Non-negotiable rules
1. **Greet on hesitation evidence, never page load.** **6 triggers** with exact thresholds in `docs/TOUCHPOINTS.md` (paid-search cost-intent and copy/print REMOVED per Aug 20 feedback — do not re-add).
2. **One proactive attempt per session; silent after dismissal; never proactive on checkout; never greet cert owners.**
3. **Always disclosed as an AI** with a human colleague one message away.
4. **Zero hallucination** — KB-sourced claims only. **KB must ingest the actual course content + lecture transcripts** (Aug 20 feedback), plus: 95 contact hours, IACET accredited, 24 pharmacology hours (counts toward Rx), modules (lab interpretation, cardiometabolic, HPA axis, immunity/inflammation, gut health), Jenni Gallagher MSN NP-C + 6 SMEs, self-paced, 1-yr access, 3–6 mo typical completion, Affirm on FHEA only.
5. **Objection-sequenced selling** — never mention price to a Clinically Curious NP until rigor is resolved. Nurture leads with depth, not discount.
6. **Emails are continuations** — subject = her actual objection; stop on resolution; first ~50 human-approved. **Non-engaged NPs also get an agent-written email inviting them to interact with the agent.**
7. **Cart rescue removes the blocker in ~30s** — Affirm monthly figure, or asking what outstanding question she has (NOT the employer invoice — removed Aug 20).
8. **Hard message-length cap** everywhere.
9. **Holdout group required** — lift over 8% baseline must be provable.

## Key numbers
$2.8M July FM cart opportunity (Matomo/FHEA) · 8% baseline conversion → 10–12% target · $3,999 list · warm list 2,500 → 1.

## People
Gail Applin (product owner, vision author, KB fact seed) · Yazir Phelps (exec sponsor; persona sign-off w/ Heather; escalation human) · Heather Bartel (content; persona sign-off w/ Yazir) · Nader Rustom (business case/GTM) · Devin (IT — candidate for WordPress snippet deploy on fhea.com) · Molly/Prabhu (approvals) · Sam (build).

## Gotchas
- Vision doc ends at §3.3 — likely a draft; Aug 20 feedback amended it (see FEEDBACK-2026-08-20.md); confirm any further sections.
- July's 10% discount plan vs vision's depth-not-discount stance: unresolved — ask Gail.
- fhea.com cert page is WordPress (deploy path for the widget).
- Course content/transcripts access path for KB ingestion: TBD (LMS export vs API).
- Persona name TBD, owner Heather/Yazir ("Ruby" taken). Elite NP carts stuck in Teachable (P4 blocker). $295K/$1M/$2.8M are different cuts — never interchange.

## Git
Repo: github.com/samcolibri/cert-sdr-agent (**public** — no internal creds ever; leakproof hooks active). Pages: samcolibri.github.io/cert-sdr-agent. All commits as samcolibri.
