# Product Vision — FHEA Functional Medicine AI SDR Agent

_Author: **Gail Applin**, Sr. Director of Digital Marketing, Colibri Healthcare · **August 17, 2026**_
_Faithful markdown conversion of the source document ([original .docx](source/2026-08-17-fhea-fm-ai-sdr-agent-vision-gail-applin.docx)). This document supersedes the July discovery framing and is the current source of truth for product direction._

---

> An always-on program advisor that meets nurse practitioners on the Functional Medicine Certification landing page, intervenes when a cart is about to be abandoned, and writes the follow-up email itself.

| | |
|---|---|
| **Product** | Functional Medicine Certification (FMP-C) by Elite NP, sold on fhea.com and elitenp.com |
| **List price** | $3,999, one time, Affirm financing available (on FHEA only) |
| **Prepared by** | Gail Applin, Sr. Director of Digital Marketing, Colibri Healthcare |
| **Date** | August 17, 2026 |

## 1. Executive Summary

The Functional Medicine Certification is the highest value single SKU in the FHEA catalog at $3,999.

A $3,999 clinical credential is a considered purchase. The nurse practitioner reading that page is weighing a career pivot, a cash pay practice, a year of evenings, and money that in many cases is coming out of a household budget. She has real questions — about accreditation, about state prescribing authority, about whether the business module actually teaches her to charge for this work, about whether her employer will reimburse it. Today she has nowhere to ask them at the moment she is asking them.

This document proposes an AI SDR agent, positioned to the customer as a Functional Medicine **program advisor**, that closes that gap in three places. It greets and qualifies on the landing page when behavior signals hesitation rather than disinterest. It intervenes at the cart and checkout when a nurse practitioner has committed enough to add the certification but is stalling. And when she still leaves, it writes her cart recovery email itself, grounded in what she actually asked and did, rather than sending her the same generic sequence everyone else gets.

## 2. The Vision

We are building **a single agent with one identity across three touchpoints, not three disconnected automations**. She has a name, a consistent voice, memory of the conversation, and a defined scope of authority. Internally she is the Functional Medicine AI SDR. To the customer she is a program advisor, and she says plainly that she is an AI assistant with a human colleague one message away.

### 2.1 The three touchpoints

| Touchpoint | Moment | Job to be done |
|---|---|---|
| **Landing page advisor** | On `/functional-medicine-certification/`, when behavior signals hesitation rather than disinterest | Answer the unasked question, classify the decision state, capture identity, move her to cart |
| **Cart and checkout rescue** | After add to cart, on exit intent, on payment stall, on coupon hunting | Name and remove the single specific blocker in the next thirty seconds, or capture permission to follow up |
| **Agent-written recovery email** | After abandonment, in HubSpot | Continue the actual conversation she had, not a generic reminder that she left something in a cart |

The third touchpoint is what makes this different from a chatbot. Most cart abandon programs send a template. Here, **the agent that had the conversation writes the email**, so the subject line references her actual objection, the body answers it, and the sequence stops as soon as it is resolved.

## 3. Touchpoint One: The Landing Page Advisor

The failure mode of proactive chat is interrupting people who are already converting and ignoring the ones who are stuck. So the agent does not greet on page load. **It greets on evidence of hesitation.**

### 3.1 Trigger inventory

| Signal | Threshold | Agent opening move |
|---|---|---|
| Engaged dwell with no CTA click | 45 seconds and 60% scroll depth | Offer the one thing most people at that scroll position ask about |
| Pricing section dwell | 10 seconds in view of the price block | Lead with total cost clarity and the Affirm monthly figure, unprompted |
| FAQ accordion opened twice | Two or more opens | Answer the category she is opening rather than making her read |
| Repeat visit | Second or later visit within 14 days | Acknowledge the return and ask what is still open |
| Paid search cost intent | Keyword or ad group containing cost, price, financing, worth it | Open on price and payment before she has to ask |
| Known contact from email | HubSpot cookie match | Skip discovery, reference what she already told us, go straight to the open question |
| Copy or print attempt | Selection copy or print dialog | Offer the employer justification one-pager and an invoice |
| Idle mid page | 90 seconds without interaction | Single low-friction offer, then go quiet |

### 3.2 Rules of engagement

- **One proactive attempt per session.** If she dismisses, the widget stays available but never speaks again in that session.
- **No proactive greeting on the checkout page**, where the only correct behavior is to get out of the way.
- **No proactive greeting to a logged-in member who already owns the certification.**
- **A hard cap on message length**, because a wall of text at second forty-five reads as a pop-up, not a person.

### 3.3 Sample conversation — the "Clinically Curious"

| | |
|---|---|
| **Trigger** | Organic search entry, 52 seconds dwell, scrolled past the curriculum block, no CTA click. |
| **Agent** | "Hi, I am the FHEA program advisor and I am an AI assistant, so you can ask me anything about this certification without a sales call. Most nurse practitioners at this point in the page are trying to work out how clinically deep it actually goes. Want me to walk you through the lab interpretation and prescribing content?" |
| **NP** | "Honestly yes. I have looked at three functional medicine programs and two of them were basically supplements and vibes." |
| **Agent** | "That is a fair filter. Here is the concrete answer. The program is 95 contact hours, IACET accredited, and 24 of those hours are pharmacology, so it counts toward Rx requirements. There is a full module on lab interpretation in functional medicine, and separate modules on cardiometabolic health, HPA axis dysregulation, immunity and inflammation, and gut health. It is led by Jenni Gallagher, MSN, NP-C, with six subject matter experts. If you want, I can send you the full module-by-module outline so you can compare it side by side with the other two." |
| **NP** | "Send the outline. And how long does it take?" |
| **Agent** | "It is fully online and self-paced with a year of access, and most providers finish in three to six months. What is your email and I will send the outline now. I will also flag the two modules people find most demanding so you can plan around them." |
| **Outcome** | Lead captured, decision state tagged **Clinically Curious**, primary objection tagged **rigor**, outline delivered, contact enters a nurture path that leads with depth rather than discount. |

Note what the agent did **not** do. It did not mention price. A Clinically Curious nurse practitioner who is not yet convinced the program is serious will read a price as a reason to leave. **Price becomes relevant the moment rigor is resolved, and not before.**

---

_End of source document (sections beyond 3.3 not present in the Aug 17 draft)._

## Verified product facts introduced by this document (KB seed)

- FMP-C = Functional Medicine Certification **by Elite NP**, sold on both fhea.com and elitenp.com
- $3,999 one-time · **Affirm financing on FHEA only**
- **95 contact hours**, **IACET accredited**, **24 pharmacology hours** (counts toward Rx requirements)
- Modules: lab interpretation in functional medicine, cardiometabolic health, HPA axis dysregulation, immunity & inflammation, gut health
- Led by **Jenni Gallagher, MSN, NP-C**, with six subject matter experts
- Fully online, self-paced, **1 year of access**, most providers finish in **3–6 months**
- Top buyer questions: accreditation, state prescribing authority, does the business module teach charging for this work, employer reimbursement
