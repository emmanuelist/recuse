# Decisions

Append-only. Newest last. Record a decision when it is made — reconstructing
reasoning later loses exactly the part that mattered.

Format: what was decided, what else was considered, why, and what would reverse it.

---

## D001 · Enter Foxit, Nutrient, and SerpApi — not one track
**2026-08-20**

The rules state verbatim: *"Teams can solve no challenges (build whatever you
want) or can submit to as many challenges as they want."* Multi-track entry is
explicitly permitted and most entrants will pick one challenge and stop.

**Considered:** a single-track entry (simpler, less risk of dilution); adding Xano
for a fourth track; Perfect Corp for visibility.

**Why:** the three chosen tracks compose into one pipeline rather than three
bolt-ons, so the additional tracks cost hours rather than days. Xano requires
committing the entire backend to a low-code platform — a blocker by definition
with 14 days. Perfect Corp's access appears gated by approval, which is the exact
risk we are avoiding.

**Reverses if:** M1 slips past Aug 25. Then drop to Foxit alone and spend the
remainder on the demo and interface.

## D002 · The name is Recuse
**2026-08-20**

To recuse is to decline to act on a matter where you have no standing — precisely
what the signing boundary enforces. One word, legal register matching the domain,
distinctive enough to be searchable.

**Considered:** Warrant (strong, but a common word and weak as a mark); Demur
(reads as hesitation rather than an enforced boundary); Vires (from *ultra vires*
— most distinctive, too opaque for a four-minute judging window).

**Reverses if:** a trademark conflict surfaces. Nothing else.

## D003 · Drop Doctavian from the critical path
**2026-08-20**

Initially planned as the document-generation stage. Two findings removed it:
Foxit's free tier already includes Document Generation ("Every self-serve plan
includes eSign, PDF Services, Document Generation, and PDF Embed under one
account-level plan with shared credits"), so Doctavian was never load-bearing —
and its trial terms cannot be verified without signing up, making it the only
dependency on the board that could block us.

**Why it matters:** swapping Doctavian for SerpApi raised reachable prize money
from $3,500 to $5,500 while removing the single largest unknown.

**Reverses if:** the 30-minute timebox (ISSUE-010) yields a key without a card and
M1–M3 are already solid. Then generation moves to Doctavian and a fourth track
opens. Not before.

## D004 · Next.js on Vercel Hobby, Neon Postgres
**2026-08-20**

Constraint from the outset: zero spend. Both verified free with no credit card.
Vercel supplies the public HTTPS endpoint the eSign webhook requires, which is a
hard requirement rather than a convenience.

**Considered:** Cloudflare Workers (also free, more generous limits, but a heavier
lift for a Next.js app in a 14-day window).

**Note:** Vercel Hobby is restricted to non-commercial personal use. A hackathon
entry satisfies this; taking revenue later would not.

## D005 · The signing gate lives inside the tool's `run()`
**2026-08-20**

The Anthropic SDK documents this as the human-in-the-loop pattern: *"gate inside
the tool's `run()` function (return a 'user declined' result)"* — no manual loop
needed.

**Why:** it makes the product's central claim structural rather than instructed.
The model cannot sign because the capability does not complete, not because a
system prompt asked it not to. A judge can be shown the function.

**Considered:** a manual agentic loop with an approval interrupt — more code, more
failure modes, and no stronger a guarantee.
