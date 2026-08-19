# Open Questions & Blockers

_Status as of 2026-08-19 (post-vision-doc). Superseded July items removed — see git history._

## Product decisions (Gail owns)

1. **Persona name + voice sign-off** — she "has a name" per the vision; it isn't specified yet. ("Ruby" is taken by the site-wide advisor.)
2. **Scope of authority, final list** — confirm what she may promise (outline, one-pager, invoice, Affirm quotes) and may not (discounts? the July plan had a 10% offer — the vision doc doesn't mention discounts and leads with depth-not-discount; reconcile).
3. **Remaining decision-state archetypes** — vision §3.3 defines only "Clinically Curious"; the doc ends at §3.3. Are more sections coming (cart rescue detail, email examples, metrics)? Get the complete doc or workshop the remaining archetypes.
4. **Nurture path definitions per state** — what does the depth-led nurture look like vs. the July education track?

## Technical decisions

5. **Widget deployment path** — who is the IT resource that publishes a JS snippet to fhea.com (and later elitenp.com)? What CMS/tag manager do the sites run?
6. **Signal feasibility audit** — cookie-match with HubSpot, scroll/dwell/FAQ instrumentation, paid-search intent (UTM/ad-group), copy/print detection, exit intent, payment-stall events on checkout: confirm each is technically capturable on the current sites, and which need Matomo vs. custom JS.
7. **Where conversations live** — proposed: Cloudflare Worker + KV/D1 for memory, mirrored to HubSpot contact properties. Confirm data-residency/privacy sign-off.
8. **Checkout platform events** (Phase 3) — what runs fhea.com checkout, and can we hook payment-stall/coupon-field events?
9. **Recovery-email sending identity** — the advisor's name needs a real mailbox/sender identity in HubSpot; replies must route back to the agent.
10. **Affirm figures** — source of truth for monthly payment quotes (FHEA only); must be computed, not hallucinated.

## Carried from July (still open)

- Elite NP carts in Teachable → HubSpot capture (blocks Phase 4 / elitenp.com).
- $295K vs $1M vs $2.8M opportunity figures unreconciled for the business case.
- 1–2 real student success stories (content is anemic; needed for nurture + emails).
- Named human colleague for escalations (Yazir).
- Holdout/comparison group agreement.

## Process

- Confirm whether the Aug 17 vision doc has sections beyond §3.3 (the file ends mid-document — likely a draft). If yes, ingest and update TOUCHPOINTS.md.
- Re-baseline the timeline: July's "2-week sprint from Aug 4" was superseded by the vision work; set new phase dates with Gail/Nader.
