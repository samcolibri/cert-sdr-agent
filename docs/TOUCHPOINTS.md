# Touchpoint Behavior Spec

_Derived from [VISION.md](VISION.md) (Gail Applin, Aug 17 2026). This replaces the July 7-touch email sequence spec (preserved in git history) — recovery emails are now agent-written per contact, not templated touches._

## Shared identity (all touchpoints)

- One persona: internally the **Functional Medicine AI SDR**; to customers a **program advisor**. Name TBD (needs Gail's approval; "Ruby" is taken by the site-wide advisor).
- Always disclosed as an AI assistant, "with a human colleague one message away."
- One memory: conversations, decision state, primary objection, delivered assets — carried across page, cart, and email.
- Hard cap on message length everywhere.
- Scope of authority — MAY: answer program questions from the KB, send the module outline, produce an employer-justification one-pager and invoice, quote Affirm monthly figures (FHEA only), capture email/permission. MAY NOT: invent discounts, give clinical advice, make accreditation claims beyond the KB, contact anyone who dismissed her that session.

## Touchpoint 1 — Landing Page Advisor

Greets **only on evidence of hesitation** (never page load):

| Signal | Threshold | Opening move |
|---|---|---|
| Engaged dwell, no CTA click | 45s + 60% scroll | Offer the thing most people at that scroll position ask about |
| Pricing section dwell | 10s in view of price block | Total cost clarity + Affirm monthly figure, unprompted |
| FAQ accordion opens | ≥2 opens | Answer that category directly |
| Repeat visit | 2nd+ visit within 14 days | Acknowledge return, ask what's still open |
| Paid search cost intent | kw/ad group: cost, price, financing, worth it | Open on price and payment first |
| Known contact | HubSpot cookie match | Skip discovery, reference what she already told us |
| Copy / print attempt | selection copy or print dialog | Offer employer-justification one-pager + invoice |
| Idle mid page | 90s no interaction | Single low-friction offer, then go quiet |

**Rules:** one proactive attempt per session · dismissal = available but silent · never proactive on checkout · never greet logged-in owners of the cert.

**Job:** answer the unasked question → classify decision state → capture identity (email) → move to cart.

**Decision states:** first archetype **Clinically Curious** (objection: *rigor* — wants depth: 95 contact hours, IACET, 24 pharm hours, module list, faculty). Rule: **no price talk until rigor is resolved.** Further archetypes (e.g. price-sensitive, employer-funded, career-pivot) to be specified with Gail as the vision doc grows past §3.

## Touchpoint 2 — Cart & Checkout Rescue

Moments: **exit intent · payment stall · coupon hunting** after add-to-cart.

**Job:** name and remove the *single specific blocker* within ~30 seconds, or capture permission to follow up. Examples: payment stall → Affirm monthly breakdown (FHEA); coupon hunting → what's included at full value + any legitimately available offer; exit intent → "what's the one thing holding you back?"

No proactive greeting on the checkout page itself — intervention only on the defined stall signals; otherwise get out of the way.

## Touchpoint 3 — Agent-Written Recovery Email

After abandonment, in HubSpot. **The agent that had the conversation writes the email:**

- Subject line references her actual objection; body answers it; CTA matches her decision state.
- No prior conversation? Signal-grounded draft (what she viewed, where she stalled) — still per-contact, never a template.
- Sequence **stops immediately** on reply, purchase, or objection resolution. Replies route back to the same agent/memory.
- Nurture path matches the state — Clinically Curious gets depth (outline, faculty, module detail), not discounts.
- First ~50 generated emails pass a human approval queue; autonomy is graduated per category after stakeholder sign-off.
