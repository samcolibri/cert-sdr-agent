# Open Questions & Blockers

_Status as of 2026-08-20 (post-feedback). Superseded items removed — see git history and [FEEDBACK-2026-08-20.md](FEEDBACK-2026-08-20.md)._

## Product decisions

1. **Persona name + voice sign-off** — owner now **Heather/Yazir** (Aug 20). ("Ruby" is taken by the site-wide advisor.)
2. **Scope of authority, final list** — confirm what she may promise (outline, one-pager, Affirm quotes) and may not (discounts? the July plan had a 10% offer — the vision leads with depth-not-discount; reconcile).
3. **Remaining decision-state archetypes** — vision defines only "Clinically Curious"; workshop the rest with Gail.
4. **Nurture path definitions per state** — what does the depth-led nurture look like vs. the July education track?

## Technical decisions

5. **Course content + transcript ingestion path** *(new, Aug 20 — highest priority: it feeds the KB for P1)* — where do the modules and lecture transcripts live (Teachable? NetSuite/BenchPrep?), export format, who grants access, and any content-security constraints on storing course material in the KB.
6. **Widget deployment** — fhea.com cert page is **WordPress**; Devin (IT) may be able to deploy the snippet (Aug 20). Confirm with Devin; same question later for elitenp.com.
7. **Signal feasibility audit** — cookie-match with HubSpot, scroll/dwell/FAQ instrumentation, exit intent, payment-stall events on checkout: confirm each is technically capturable on the current sites, and which need Matomo vs. custom JS. (Paid-search-intent and copy/print detection dropped — triggers removed.)
8. **Where conversations live** — proposed: Cloudflare Worker + KV/D1 for memory, mirrored to HubSpot contact properties. Confirm data-residency/privacy sign-off.
9. **Checkout platform events** (Phase 3) — what runs fhea.com checkout, and can we hook payment-stall/coupon-field events?
10. **Recovery-email sending identity** — the advisor's name needs a real mailbox/sender identity in HubSpot; replies must route back to the agent.
11. **Affirm figures** — source of truth for monthly payment quotes (FHEA only); must be computed, not hallucinated.

## Carried from July (still open)

- Elite NP carts in Teachable → HubSpot capture (blocks Phase 4 / elitenp.com).
- $295K vs $1M vs $2.8M opportunity figures unreconciled for the business case.
- 1–2 real student success stories (content is anemic; needed for nurture + emails).
- Named human colleague for escalations (Yazir).
- Holdout/comparison group agreement.

## Process

- Confirm whether the Aug 17 vision doc has sections beyond §3.3 (the file ends mid-document — likely a draft). If yes, ingest and update TOUCHPOINTS.md.
- Re-baseline the timeline: July's "2-week sprint from Aug 4" was superseded by the vision work; set new phase dates with Gail/Nader.
