# Sequence Spec — Abandoned Cart Recovery (v0, Nader's design from Jul 28 call)

Target: Functional Medicine / FHEA abandoned carts. All copy AI-drafted, KB-grounded, human-approved before launch. Timing values are starting points — tune from data.

| # | Channel | Timing | Intent | Content |
|---|---------|--------|--------|---------|
| T1 | Email | ~15 min after abandonment | Human check-in | "Noticed you were thinking about taking this course — that's awesome. Any questions I can answer that are holding you back?" Warm, inviting, zero pressure. |
| T2 | Email | +2 days (no reply) | Transformation story | Current-state → future-state story ("Lucy was in your situation… after the certification she was able to…"). Persona-matched: FHEA = better patient care/confidence; ENP = new revenue stream. Success-story content needed from Heather (currently anemic). |
| T3 | Email | +2–3 days | Incentive | Short note: 10% discount "if it makes things easier to check out." |
| T4 | Email | +2–3 days | Discount reminder + Q&A offer | "Offered the 10% but imagine you may need more information — what questions can I answer?" |
| T4b | **SMS** | same day as T4 | Nudge (not education) | "Sent you an email earlier — quick note that there's a 10% discount waiting on your cart." Opt-in contacts only. |
| T5 | Email | +3 days | Value asset | Lead magnet / one-pager / resource "a lot of folks find useful before deciding." Asset from Heather's education content. |
| T6 | Email | +3–4 days | Breakup | "Offered a discount, offered education — seems like it might not be the right time. Anything we can do to help between now and when it is?" Explicitly the last email of this sequence. |
| → | Handoff | after T6 | Nurture | Contact rolls into the warm-leads nurture track (the ~2,500 list): pure education — case studies, stories, objection content. No hard selling. |

## Reply handling (any touch)
- Reply → agent classifies: **question / objection / buying signal / opt-out / unrelated**.
- Questions & objections answered from the KB (five objection pillars: why does this matter, will it help me grow, what makes this different, do I have time, is the cost worth it). Unknown → escalate to designated human (Yazir to assign), never guess.
- Buying signal → checkout link (+ active discount code if already offered).
- Any purchase, unsubscribe, or STOP → immediate exit from sequence.

## Guardrails
- Discount: 10% max, only from T3 onward, single-use code per contact.
- SMS: opt-in only, quiet hours, STOP honored instantly, nudge-only role.
- No clinical/medical claims beyond sourced KB facts. Brand voice per site (FHEA ≠ Elite NP).
- Suppress enrollment for anyone in an active human conversation or existing customer of that cert.
