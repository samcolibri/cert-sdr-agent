# Cert SDR Agent — Claude Code Context

Read this on every session in this repo. Full design: `ARCHITECTURE.md`. Requirements source of truth: `docs/transcripts/` (verbatim) distilled in `docs/MEETING_NOTES.md`.

## What this is
B2C AI SDR that recovers abandoned carts and converts warm leads for Colibri's $3,999 NP certifications (Functional Medicine, HRT, Dermatology, Women's Hormone) on **FHEA** and **Elite NP**. Phase 1 goal: **close the sale via email + SMS with zero humans** — not book meetings. Start: Functional Medicine on FHEA only.

## Non-negotiable rules
1. **Zero hallucination** — every product claim must trace to a KB entry with a source. Unknown → escalate, never guess. (Healthcare audience.)
2. **HubSpot-native delivery** — no Outreach, no Apollo/ZoomInfo, no new sequencer. HubSpot email + native SMS (opt-in only).
3. **Human approval before autonomy** — all templates and the first ~50 replies reviewed. Stakeholder approval is the only success gate (KELLI lesson).
4. **10% discount max**, only from touch 3 onward, single-use codes.
5. **Keep Ruby separate** — the on-site purchase advisor is a different product; don't merge or confuse.
6. **Tandem, not replacement** — traditional HubSpot workflows continue; the agent complements them.
7. **Holdout group required** — lift over the 8% baseline must be attributable.
8. Brand voices differ: FHEA buyer = competency gap / better patient care; Elite NP buyer = new revenue stream for their practice.

## Key numbers
8% abandoned-cart conversion baseline (74 contacts/$295K/6 sales) · target 10–12% · $2.8M July FM cart opportunity (Matomo) · warm list 2,500 → 1 conversion · price $3,999.

## People
Yazir Phelps (sponsor, wants no humans added) · Gail Applin (quarterback; requires auto-refreshing KB, no manual feeding) · Heather Bartel (content: 6-email objection workflows per cert) · Nader Rustom (business case, sequence design) · Molly Swagler (green light) · Prabhu (Sam's allocation).

## Structural gotchas
- Elite NP carts are in **Teachable**, not HubSpot — ENP rollout blocked until captured (Workstream 3).
- Courses consolidating into NetSuite/BenchPrep — point KB sync there.
- The $295K / $1M / $2.8M figures are different cuts — never quote them interchangeably.

## Timeline
Data from Gail/Heather ~Jul 30 → business case Aug 1 (Nader) → kickoff Tue Aug 4 → 2-week sprint → Phase 1 live ~Aug 18.

## Git
Repo: github.com/samcolibri/cert-sdr-agent (private). All commits as samcolibri.
