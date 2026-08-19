# Meeting Notes — Distilled Requirements (July discovery)

> **⚠️ Superseded on product direction by [`VISION.md`](VISION.md)** (Gail Applin, Aug 17 2026) — the project evolved from an email/SMS recovery sequence into a single three-touchpoint program advisor. These notes remain the record of business context, numbers, stakeholders, and constraints.

Verbatim transcripts live in [`transcripts/`](transcripts/); original .docx in [`source/`](source/). This file is the working summary.

---

## Call 1 — Jul 22, 2026 (24m) — Yazir Phelps × Nader Rustom

**Yazir = executive sponsor. This call defined the WHY and the ambition level.**

### Product context
- Certifications launched ~2025, first in Elite NP, now sold on FHEA too. FHEA and Elite NP are **separate brands with separate websites**, but both run on HubSpot.
- Four certs discussed: **Functional Medicine, HRT (hormone replacement therapy), Dermatology, Women's Hormone Treatments** (a women-focused HRT variant). ~80–90 hours each, **list price $3,999**.
- Pain point by brand:
  - **FHEA buyers:** competency gap — patients ask about emerging areas (functional/integrative medicine, HRT, derm) that school never taught. Buying to provide better care.
  - **Elite NP buyers:** same knowledge gap, but buying to **create new revenue streams** in their own practice/business.

### The problem
- Nobody buys $4K on a website visit. Buyers want reassurance, want to ask questions, want a human — there is no inside sales team and Yazir explicitly does **not** want to add humans yet.
- Current abandoned-cart follow-up = generic "you left something + 10%" email. Not signal-based, not tailored, converts poorly.
- FHEA had **~$1M in abandoned carts from Functional Medicine** (month sample) — Yazir wants those people nurtured and closed.

### Target lists (three warmth levels)
1. **Abandoned carts** (highest intent — start here)
2. **Leads** (form fills)
3. **Warm audiences** (opened emails, visited site)

### The ask
- **Phase 1: pure AI SDR closes the sale via email + SMS.** HubSpot has native texting; contacts opt in with phone numbers. "Close through the agent would be my desire, because what I'm trying to do is not add humans."
- **Phase 2 (only if Phase 1 retrieval is insufficient):** agent books calls; Yazir designates/trains someone to take them, eventually hires an inside sales rep.
- If prospects reply with questions, Yazir will find and train an interim person to answer what the agent can't.

### Stack decisions (Nader)
- **HubSpot only.** No enrichment (no ZoomInfo/Apollo), no new sequencer (no Outreach/Gong Engage) needed for this use case.
- Ads/retargeting rejected by Yazir: "the other stuff feels like selling to them. We want to be talking to them" — human-feeling 1:1 outreach is the differentiator.

### Success measurement
- Baseline = the dedicated 10-day warm-leads campaign Yazir's team is running now (generic marketing sequence). Compare agent conversion vs that campaign's conversion.
- Related: CE business has a **$1M additional-sales goal**; that colder list could get a data append later (where they work) — but only after this works on warm lists. ("If we cannot make it work with these people, those are even colder.")

### Roles/next steps set on this call
- **Gail = project quarterback** (understands AI/agents, will pull internal data and navigate teams). Ruby purchase advisor context: it exists on-site but engagement is low.
- Yazir to send sizing data before his PTO (end of following week).
- Next: gather ICPs, pain points, stories, current→future state for the agent's brain; build metrics/business case over ~2 weeks.

---

## Call 2 — Jul 28, 2026 (36m) — Gail Applin × Heather Bartel × Nader Rustom

**Gail = quarterback, Heather = content owner. This call defined the WHAT and HOW.**

### Hard numbers
- Abandoned-cart flow (FM, ~1 month): **74 contacts worth $295K → 6 converted = 8% conversion.** 92% walk away.
- Warm leads: **~2,500 contacts → 1 conversion.**
- **Matomo shows $2.8M in July abandoned-cart opportunity for Functional Medicine on FHEA alone** (Products view → abandoned-carts toggle; Gail will provide screenshots). ⚠️ The $295K/$1M/$2.8M figures are different cuts/time windows — business case must reconcile.

### Current state
- Only generic 10%-off abandoned-cart emails existed until **Jun 9, 2026**, when FM carts were segmented into a customized FM cart-abandonment workflow (FHEA only). Directionally right, "just not enough."
- Heather has drafted, for **every certification (ENP + FHEA)**, a **6-email workflow answering the five buyer objections:** why does this matter / will it actually help me grow / what makes this different / do I have the time / is the cost worth it. Shared with Gail morning of Jul 28. Not yet fully built/live.
- Content gap: competitive positioning ("why us vs a competitor / vs a course") and **success stories/testimonials are anemic** — priority content ask.
- **Ruby** (on-site purchase advisor) has low engagement; keep the agent and traditional workflows **in tandem**, don't abandon traditional channels.

### Structural constraints
- **Elite NP abandoned carts do NOT flow into HubSpot — they're in Teachable** (LMS/POS). Can't customize by product out of Teachable. → Workstream: capture ENP carts into HubSpot before ENP rollout.
- Courses live partly in NetSuite, partly Teachable; **short-term all consolidate into NetSuite (available via BenchPrep)** → KB should sync from NetSuite so certification content changes flow into the agent automatically.
- ~6 certs total split between Fitzgerald and ENP "in a complicated fashion."

### Gail's requirements
1. **Start with ONE cert — Functional Medicine** (highest $ opportunity, most page traffic) — prove process/content/usage, then roll out. Caveat: FM audience on Elite NP may be oversaturated (product's been around longest).
2. **Auto-updating knowledge base — no manual feeding.** Scrape pages/content; sync from NetSuite as certification content changes. "I would love to not have to do that."
3. Agent shouldn't be limited to workflows/SMS — could also be an **on-site slide-in** on the cart page (after ~30s) or landing page. ("Still have questions about functional medicine? How can I help?")
4. Gail can prototype in Claude (agents + skills that scrape pages) but a customer-facing publish needs an IT resource. Also: lifecycle-marketing agents are being planned **in HubSpot** — this could fall in the same realm. Nader: HubSpot agent + **HubSpot's MCP connection to Claude** (agent built out of HubSpot, runs through a Claude skill) is a candidate shape — Sam to design.
5. "We have everything we need to start the agent part — it's just being able to connect it."

### Nader's sequence sketch (see SEQUENCE_SPEC.md)
7-touch email + SMS: fast check-in → transformation story → 10% discount → discount+Q&A reminder (with SMS nudge) → asset/lead magnet → breakup → roll into the 2,500 warm nurture list (pure education: case studies, stories).

### Insight loop (Gail)
Use the agent's inbound questions **as a survey** — learn what buyers actually ask, feed that back into traditional content and site copy. Heather: replies will reveal objections that become new Q&A content.

### Timeline & approvals set on this call
- Gail/Heather send data + educational assets within **~48 hours**.
- Nader: business case by **end of week (Aug 1)**; needs per-cert sizing, conversion rates, realistic targets (8% → 10–12%), warm-list provenance and campaign details.
- **Tue Aug 4:** next meeting = clock starts on **2-week build sprint** with Sam.
- Approvals: Molly (effectively green-lit already) → Prabhu approves Sam's allocation for 1–2 weeks.
- Amplify project: NOT abandoned — runs in parallel (Heather asked; Nader confirmed both).
- Heather owns "messaging underpinning"; build is Nader + Gail + Sam.
