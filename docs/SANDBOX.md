# Sandbox — Run & Demo Guide

The MVP sandbox is the entire cert agent in a synthetic environment: demo landing page + cart, the advisor widget (6 triggers + 3 cart rescues), the Claude brain with guardrails, agent-written recovery emails (both modes), approval queue, and scoreboard. **No HubSpot, no real sends, no real checkout.** Once approved, Track B swaps the stubs for real connections (see MVP_PLAN.md).

## Run

```bash
cd ~/projects/cert-sdr-agent
node server/server.mjs          # reads ANTHROPIC_API_KEY from env; falls back to MOCK brain
# or explicitly:
MOCK=1 node server/server.mjs   # scripted brain — demo can never die mid-showcase
```

Put `ANTHROPIC_API_KEY=sk-ant-...` in `.env` (gitignored) and launch with:
`ANTHROPIC_API_KEY=$(python3 -c "print(open('.env').read().strip().split('=',1)[1])") node server/server.mjs`

| URL | What |
|---|---|
| http://localhost:4321/ | Demo landing page (watermarked) — widget + 6 triggers |
| http://localhost:4321/cart | Cart page — exit-intent / coupon / payment-stall rescues + abandon simulator |
| http://localhost:4321/dashboard | Scoreboard + email approval queue |

## Demo script (10 min)

1. **Landing page.** Scroll to the price block and linger 10s → advisor greets with cost clarity + Affirm, unprompted. **Dismiss her** → she stays silent (rules proven live).
2. **New session** (new tab or clear sessionStorage; or `POST /api/reset` from the dashboard): scroll 60% and wait 45s → dwell greeting. Run the §3.3 "Clinically Curious" conversation — *"other programs were supplements and vibes"* → watch the KB-grounded rigor answer. Give an email → lead captured.
3. **Cart page.** Focus the coupon field (coupon-hunt rescue) or mouse to the top edge (exit intent). Click **"Simulate: leave without buying"** → the advisor writes the recovery email from that exact conversation.
4. **Dashboard.** Show the email (subject = her actual objection), click **"Generate emails for non-engaged synthetic abandoners"** → the invite-to-chat mode (Aug 20 feedback). Approve/reject. Show states, objections (survey effect), guardrail events.
5. Other trigger sims: `/?known=1` = HubSpot cookie match · revisit within 14 days = repeat-visit greeting · wait 90s = idle offer.

## What's stubbed vs real

| Real in sandbox | Stubbed (Track B) |
|---|---|
| Claude brain, persona, guardrails (code-enforced) | HubSpot contacts/lists/send (synthetic contacts + local queue) |
| KB from the live public landing page (23 sourced facts) | Course content + transcripts (`kb/ingest_transcripts.mjs` ready, folder empty until Gail delivers) |
| All 6 triggers + 3 cart rescues, client-side | Real cookie identity (simulated via `?known=1`) |
| Agent-written emails, both modes | Actual email delivery + reply routing |
| Approval queue + scoreboard | Holdout split + conversion attribution |

## Guardrails you can show live

`disclosure_injected` (AI disclosure forced on first message) · `length_capped` (wall-of-text prevention) · `price_stripped_rigor_unresolved` (objection-sequenced selling enforced in code) · `claims_flag:<n>` (any number not traceable to the KB gets flagged on the dashboard).

## KB refresh

`node kb/scrape.mjs` re-pulls the public landing page into `kb/raw/` for diffing against `kb/facts.json` (curated). `kb/transcripts/` and `kb/raw/` are **gitignored — course content never goes to the public repo.**
