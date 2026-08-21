# Current state

**Updated:** 2026-08-20 · **Milestone:** M0 Foundation · **Days to deadline:** 14

**Read `AGENTS.md` first, then this file.** Update this before you stop.
If it is stale, fix it before doing anything else.

---

## Where we are

Foundation is laid. Research is closed and recorded in `docs/RESEARCH.md`. The
repository carries build rules, milestones, decisions, and an evidence structure.

**No product code exists yet.** No dependencies installed, no API keys
provisioned, no deployment. That is M0's remaining work.

## Working right now

Nothing yet — the repo is documentation and scaffolding only.

## Blocked

Nothing blocked. Every dependency is free, self-serve, and card-free — including
the agent model, which the first research pass missed and D006 corrected.

## Next three actions

1. Provision four API keys — Foxit, Nutrient, SerpApi, Gemini. Confirm one live
   call each and capture the response to `evidence/api/`. (ISSUE-001…003, 012)
2. Scaffold Next.js + TypeScript + Tailwind, pin resolved versions into
   `AGENTS.md` § 5. (ISSUE-004)
3. Deploy the empty shell to Vercel and confirm a public HTTPS endpoint can
   receive a POST — the eSign webhook depends on it. (ISSUE-005)

## Open questions

- **Doctavian** — 30-minute timebox, not yet spent. If a key appears without a
  card, a fourth track opens for $1,000. Walk away otherwise. (ISSUE-010)
- **Hackathon keys** — Foxit TEST mode watermarks every envelope and the free
  tier is 500 credits/year. Emailing both sponsors is cheap and nobody does it.
  (ISSUE-006)

## Do not re-litigate

These are settled. See `docs/DECISIONS.md` for reasoning.

- The three tracks are Foxit, Nutrient, SerpApi. Not Xano, not Perfect Corp.
- The name is Recuse.
- The agent must never be able to sign. This is structural, not a policy string.
