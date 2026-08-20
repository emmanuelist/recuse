# Research — closed 2026-08-20

Conclusions only. Sources: the event's Devpost listing and sponsor challenge
pages, the official API World hackathon rules, the 2025 and DeveloperWeek 2026
project galleries, and each vendor's published pricing and developer docs.

## The event

DevNetwork [API + Cloud + AI] Hackathon 2026, at API World. Online since Aug 17;
in-person judging and awards Sept 2–3, Santa Clara Convention Center. Winners
announced Sept 3, 3:30–4:00 PM PT. **Remote entrants are eligible to win.**
$39,500 pool, 802 registered, 15 winning slots.

**Deadline: 2026-09-03, 10:00 PDT.**

## Judging

Two independent rounds. Losing one costs nothing in the other.

- **Round One** — every project, for the $12,500 overall prize. Criteria verbatim:
  *"1) How much progress you make 2) Concept – does it solve a real problem? and
  3) Feasibility – could this become a startup or company?"*
- **Round Two** — each sponsor judges its own challenge, its own criteria, two winners.

The decisive rule, verbatim: *"Teams can solve no challenges (build whatever you
want) or can submit to as many challenges as they want."*

No requirement that the project be built from scratch, provided we hold the IP.

## Why the odds are good

The direct predecessor — API + Cloud + Data 2025, same organizer, venue, format —
took **58 submissions** total. The organizer's larger DeveloperWeek 2026 franchise
took 323. This is the smaller franchise, paying out 15 slots. 802 registrations at
typical 5–10× attrition suggests 80–160 actual submissions.

Prior winners are competent single-claim projects, not technical marvels: *Job
Craft AI* (2025 Foxit winner), *Foxit Sentinel Pro* (DeveloperWeek 2026). Craft
and depth of integration win here.

## Sponsor intent — quoted

- **Foxit**, "Your Agent Shouldn't Sign That": *"To send anything for signature,
  your agent has to call the Foxit eSign API directly, with its own credentials,
  and a person has to sign it. That handoff is the interesting part."*
- **Nutrient**: *"turn messy documents into something useful — and trustworthy
  enough to run on real, regulated work."*
- **SerpApi**: an AI application using *"reliable, structured, real-time web data"*
  solving a meaningful real-world problem.

Three sponsors independently asking for one thing: an agent that produces a real
document, whose contents can be verified, that a human — not the agent — authorizes.

## Cost and blockers — all verified

| Dependency | Free tier | Card? |
|---|---|---|
| Foxit (eSign + doc gen + PDF services) | 500 credits/**year** | No |
| Nutrient Data Extraction | 5,000 credits/month | No |
| Nutrient Processor (watermarked — avoid) | 50 credits/month | No |
| SerpApi | 250 searches/month, 50/hr | No |
| Vercel Hobby | 1M invocations/month | No |
| Neon Postgres | 0.5 GB, 100 CU-hrs/month | No |

Foxit's 500/year is the binding constraint on the whole project. See `AGENTS.md` § 4.

## Honest expectations

Reachable purse across the three tracks is $5,500, but one team cannot win both
placements in a track. Sweeping first place in all three is ~$2,450 cash — the
optimistic tail. The expected case is winning one track, most likely Foxit.

The stronger arguments for building this are the unusually thin field, the absence
of any blocking dependency, and that the artifact is a real portfolio piece
regardless of placement.

## Rejected

- **Xano** ($2,500) — requires the whole backend on their platform. A blocker.
- **Perfect Corp** ($2,500) — access gated by approval; lane already well worn.
- **name.com** ($2,000) — hard to make load-bearing; registration costs real money.
- **Doctavian** ($1,000) — see `docs/DECISIONS.md` D003.
