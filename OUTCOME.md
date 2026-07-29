# The Outcome — In Plain English

*This page explains the whole project in simple terms. No technical background needed. For the deep technical version, see [ARCHITECTURE.md](ARCHITECTURE.md).*

---

## 1. The Problem

We sell certifications for nurse practitioners — Functional Medicine, HRT, Dermatology, Women's Hormone — at about **$4,000 each**, on our FHEA and Elite NP websites.

Here's what's happening today:

- **People want to buy, but they hesitate.** Nobody spends $4,000 on a website without asking questions first. Buyers add the course to their cart, think "let me sleep on it"… and never come back.
- **In July alone, people left $2.8 million worth of Functional Medicine certifications sitting in abandoned carts.** That's one certification, one website, one month.
- **Only 8 out of every 100 of those people end up buying.** The other 92 walk away.
- **Nobody follows up like a human would.** Today they get one generic email: "You left something in your cart, here's 10% off." That's it. No one answers their questions, no one addresses their doubts, no one talks to them.
- We also have a list of **2,500 warm leads** — people who signed up, opened our emails, visited our pages. Our current campaign has converted **exactly 1** of them.

**In short: buyers are raising their hand, and there's no one there to shake it.** The normal fix would be hiring an inside sales team. We don't want to add headcount to find out if this works.

---

## 2. The Solution

**An AI sales agent that follows up with every single hesitant buyer, like a helpful human would — by email and text message.**

Think of it as a tireless, knowledgeable salesperson who:

1. **Reaches out within 15 minutes** of someone abandoning their cart — friendly, not pushy: *"Noticed you were looking at the Functional Medicine certification — that's exciting. Any questions I can answer?"*
2. **Tells real stories** — how someone just like them took the course and what changed for them afterward.
3. **Answers their questions** — "What exactly is in it? Will this actually help my practice? Is it worth $4,000? Do I have time for 80 hours?" — accurately, using only verified facts about our courses. It never makes things up.
4. **Offers the 10% discount at the right moment** — as a nudge after the conversation, not as the opening line.
5. **Knows when to stop** — after a respectful goodbye email, it moves them into a gentle education track instead of pestering them.
6. **Tells us what buyers are worried about.** Every question it receives is logged, so our marketing team learns exactly what's stopping people from buying — like a free, always-on customer survey.

**No new headcount. No new expensive software.** It runs on HubSpot, which we already own, plus AI.

---

## 3. What It Is (and Isn't)

| It IS | It ISN'T |
|---|---|
| A follow-up salesperson made of software | A chatbot widget on the website (Ruby already does that) |
| Personal 1-on-1 emails and texts | Mass marketing blasts (we already do those) |
| Focused on closing the sale directly | A meeting-booking tool (that's Phase 2, only if needed) |
| Grounded in verified course facts | Something that invents answers |
| Starting small: ONE certification (Functional Medicine) on ONE site (FHEA) | A big-bang launch across everything at once |

---

## 4. How We'll Do It

**Step by step, over a 2-week build sprint starting Tuesday, Aug 4:**

**Week 1 — Get the conversation started**
- Build the "brain": a knowledge base of everything about the Functional Medicine certification — what's included, who it's for, common questions and honest answers. It updates itself automatically when our course pages change (no one has to manually feed it).
- Build the message sequence: 6 emails + 1 text message, written by AI, **reviewed and approved by our team before anything goes out**.
- Connect it to HubSpot so it triggers automatically when someone abandons a cart.

**Week 2 — Make it talk back**
- When someone replies with a question, the AI answers it accurately within minutes.
- If it doesn't know the answer, it hands off to a real person instead of guessing.
- Build the scoreboard: a live dashboard showing conversions, revenue recovered, and what questions buyers are asking.

**Safety rails the whole way:**
- A human approves every message template before launch, and the first ~50 AI replies.
- Texts only go to people who opted in; unsubscribe requests are honored instantly.
- We keep a comparison group on the old process, so we can *prove* the improvement is real.

**Then:** once Functional Medicine works, roll out to the other certifications, then to Elite NP.

---

## 5. What We Need to Start

| What | Who | When |
|---|---|---|
| Sales data: cart values per certification, current conversion rates, where the 2,500 leads came from | Gail | ~Jul 30 |
| Educational content: the objection-answering emails already drafted for each cert, success stories, one-pagers | Heather | ~Jul 30 |
| Business case submitted | Nader | Aug 1 |
| Final green light | Molly | after business case |
| Sam's time approved for the 2-week build | Prabhu | before Aug 4 |
| A named person to handle questions the AI can't answer | Yazir | before launch |
| HubSpot access (and confirmation texting is switched on) | Gail/IT | week 1 |

## What We Need to Finish

- Team sign-off on the message templates (they must sound like us).
- 1–2 real success stories from past students (currently our weakest content).
- Agreement on the comparison group so results are provable.
- *(Later, for Elite NP)*: getting Elite NP's abandoned carts flowing into HubSpot — today they're stuck in a separate system (Teachable).

---

## 6. The End Outcome — Money

**The goal: move abandoned-cart conversion from 8% to 10–12%.** That sounds small. It isn't:

```
Functional Medicine carts in July:            $2.8 million
Today we recover 8% of that:                  ~$224,000
At 10% we'd recover:                          ~$280,000   →  +$56,000/month
At 12% we'd recover:                          ~$336,000   →  +$112,000/month
```

**That's roughly $670K to $1.3M per year of extra revenue — from ONE certification on ONE website** — and it scales:

- 6 certifications total across both brands (each adds its own recovered revenue)
- The 2,500 warm leads (today converting ~0%: even a handful of $4,000 sales is meaningful)
- Elite NP's abandoned carts (not even measured in these numbers yet)

**What it costs:** Sam's time for ~2 weeks, AI usage fees (a few hundred dollars a month), and HubSpot texting costs. **No new hires, no new software licenses.** The alternative — an inside sales team — would cost $70K+ per rep per year before they close a single sale.

**The bonus outcome nobody's counting:** a growing database of exactly what stops buyers from purchasing — which makes our website, our emails, and our ads better too.

**How we'll know it worked:** within ~30 days of launch we compare the AI-assisted group against the comparison group. If conversion moves, we scale it. If it doesn't, we've spent two weeks and learned exactly what a human sales hire needs to overcome — either way, we stop guessing.

---

*Questions? The detailed docs: [ARCHITECTURE.md](ARCHITECTURE.md) (technical design) · [docs/SEQUENCE_SPEC.md](docs/SEQUENCE_SPEC.md) (the exact messages) · [docs/BUSINESS_CASE.md](docs/BUSINESS_CASE.md) (the numbers) · [docs/MEETING_NOTES.md](docs/MEETING_NOTES.md) (where all this came from).*
