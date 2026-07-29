# Open Questions & Blockers

_Status as of 2026-07-28. Review at Aug 4 kickoff._

## Waiting on people

| Item | Owner | Due |
|---|---|---|
| Data package: per-cert sizing, conversion rates, warm-list provenance, Matomo screenshots | Gail | ~Jul 30 (48h) |
| Educational assets: 6-email objection workflows per cert, one-pagers, success stories | Heather | ~Jul 30 |
| Business case submission | Nader | Aug 1 |
| Green light | Molly | after business case (soft yes already) |
| Sam allocation approval (1–2 wks) | Prabhu | before Aug 4 sprint start |
| Designated human for escalated replies (interim, trained) | Yazir | before launch |

## Technical decisions (Aug 4 kickoff with Nader/Gail)

1. **Build shape:** HubSpot workflows + Claude skill via HubSpot MCP (fast) vs Cloudflare Worker webhook service (autonomous replies) — ARCHITECTURE.md recommends A→B across the two sprint weeks.
2. **HubSpot access:** which portal(s)? FHEA and Elite NP are both "on HubSpot" — same portal or two? API/private-app access for Sam.
3. **SMS:** confirm HubSpot SMS is provisioned/licensed and what % of the FM cart segment has SMS opt-in.
4. **Reply capture:** how do email replies route today (shared inbox? conversations inbox?) — needed for the reply-handler webhook.
5. **Discount codes:** who issues single-use 10% codes, and in which system (HubSpot? Teachable? NetSuite checkout?).
6. **Holdout design:** get Gail's sign-off on splitting FM cart traffic agent-vs-existing-workflow so lift is provable.
7. **KB storage:** repo-markdown + embeddings vs Airtable — pick at kickoff (bias: simplest thing that supports source-tracking).
8. **Sender identity:** whose name/mailbox does the agent send as? (Human-feel requirement — needs a real persona; agent codename TBD, "Ruby" is taken by the site advisor.)
9. **Publish path for anything customer-facing** (slide-in later): IT resource Gail flagged.

## Known data gaps / risks

- Elite NP carts live in Teachable, invisible to HubSpot (Workstream 3 — prerequisite for ENP rollout).
- $295K vs $1M vs $2.8M opportunity figures unreconciled.
- Elite NP FM audience possibly oversaturated (product fatigue) — expect weaker lift there.
- Success-story content is anemic — T2 (transformation story) blocked on Heather until at least 1–2 real stories exist.
- Courses migrating Teachable → NetSuite/BenchPrep "short term" — KB sync should target NetSuite, but timing unknown.
