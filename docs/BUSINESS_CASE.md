# Business Case — Inputs & Skeleton

Owner: Nader. This file tracks the numbers and where they come from. Updated 2026-08-19 for the [VISION.md](VISION.md) scope: the three-touchpoint advisor adds two upside lines the July case didn't count — **pre-abandonment saves** (page/cart interventions convert people who never enter the abandoned-cart pool) and **lead capture** from hesitating visitors (tagged by decision state and objection).

## Known numbers (as of Jul 28)

| Metric | Value | Source | Confidence |
|---|---|---|---|
| FM abandoned-cart opportunity, July 2026, FHEA | **$2.8M** | Matomo (Products → abandoned carts), Gail live on call | High (screenshot pending) |
| Abandoned-cart flow performance (~1 month, FM) | 74 contacts, $295K value, 6 converted = **8%** | Yazir → Nader (chat) | Medium — window/cut unclear |
| Earlier FM abandoned-cart figure | ~$1M | Yazir, Jul 22 call | Low — likely different window |
| Warm leads list | ~2,500 contacts, **1 conversion** | Yazir/Nader | Medium — campaign still running |
| List price per certification | $3,999 | Yazir | High |
| CE adjacent goal (future phase) | $1M additional sales | Yazir | Context only |

⚠️ **Reconcile before submitting:** $295K vs $1M vs $2.8M are different cuts (flow-enrolled contacts vs monthly Matomo cart value). Define: time window, brand, cert, and whether "opportunity" = cart value or enrolled-flow value.

## Awaiting from Gail/Heather (requested Jul 28 — chase any still outstanding)

- [ ] All certs list with per-cert pipeline value (Matomo screenshots)
- [ ] Which cert to start on (confirmed: Functional Medicine) + rollout order for the rest
- [ ] Per-cert conversion rates today
- [ ] Warm-leads provenance: where the 2,500 came from, ENP vs Fitzgerald split, what campaign ran, what it converted at
- [ ] Educational resources/assets inventory (Heather's 6-email objection workflows per cert, one-pagers, lead magnets)
- [ ] Matomo access or exports for Sam

## The math (template)

```
Recovered revenue = cart_value × (target_conv − baseline_conv)
FM/FHEA July example: $2.8M × (10% − 8%) = $56K/month incremental
                      $2.8M × (12% − 8%) = $112K/month incremental
```
(Replace $2.8M with the reconciled addressable value; extend across certs and brands at rollout.)

Cost side: ~zero incremental headcount (that's the point) — Claude API + build time (Sam, phased P1–P4) + HubSpot delivery costs. Compare against the alternative Yazir named: hiring an inside sales rep ($70K+/yr per rep).

## Upside not in the recovered-cart math (vision additions)

- **Pre-abandonment saves** — page advisor + cart rescue convert visitors who never enter the abandoned-cart pool; invisible in the 8% baseline, pure upside.
- **Lead capture** — hesitating visitors become tagged leads (decision state + objection) entering matched nurture paths.
- **Objection intelligence** — a dataset of what actually blocks buyers, feeding site copy, email content, and ads.

## Success criteria

1. Abandoned-cart conversion: **8% → 10–12%** on FM/FHEA with agent-written recovery emails (vs holdout on the existing workflow).
2. Advisor-conversation → add-to-cart rate and lead-capture volume benchmarked in the Phase 2 pilot.
3. Warm-leads: beat the July dedicated campaign's conversion (1/2,500 baseline).
4. Qualitative: tagged objection/decision-state dataset produced for the content team (survey effect).
