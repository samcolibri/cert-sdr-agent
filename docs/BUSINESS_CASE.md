# Business Case — Inputs & Skeleton

Owner: Nader (submission target Aug 1, 2026). This file tracks the numbers he needs and where they come from.

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

## Awaiting from Gail/Heather (48h from Jul 28)

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

Cost side: ~zero incremental headcount (that's the point) — Claude API + build time (Sam, 1–2 wks) + HubSpot SMS costs. Compare against the alternative Yazir named: hiring an inside sales rep.

## Success criteria (from calls)

1. Abandoned-cart conversion: **8% → 10–12%** on FM/FHEA with agent sequence (vs holdout on existing workflow).
2. Warm-leads: beat the current dedicated campaign's conversion (baseline lands when campaign ends ~early Aug).
3. Qualitative: objection/question dataset produced for content team (survey effect).
