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

## M0 progress

Scaffold, database, and green gate are done. Remaining M0 item is the Vercel
deploy, which needs no further credentials.

- Next.js 16.3.1 + React 19.2.8 + Tailwind 4 + TypeScript strict
- Drizzle schema migrated to Neon: `runs`, `documents`, `agent_events`,
  `extractions`, `corroborations`, `authorizations`
- `npm run gate` green — lint, build, typecheck
- Tables are empty, which is correct: no fabricated seed data

## Working right now

Four credentials provisioned and verified against live APIs on 2026-08-20.
Responses captured to `evidence/api/`.

| Provider | Status |
|---|---|
| Gemini | Valid. `gemini-3.7-flash` confirmed present on this account. |
| SerpApi | Valid. Free Plan, 250/250 searches remaining. |
| Foxit PDF Services + Doc Gen | Valid. Verified with negative controls; 0 credits spent. |
| Nutrient | **403 Forbidden** — see ISSUE-014 |
| Foxit eSign | **Separate credentials required** — see ISSUE-015 |
| Neon | Valid. PostgreSQL 18.6, us-east-1, 6 tables migrated. |

Foxit host is `https://na1.fusion.foxit.com/pdf-services`, authenticating with
`client_id` and `client_secret` request headers (not OAuth token exchange).

## Blocked

Two P0s, both needing action in a vendor dashboard rather than in code:

- **ISSUE-015 blocks M1**, the thesis milestone. No eSign credentials means no
  authorization boundary to demonstrate.
- **ISSUE-014 blocks M3.** Not urgent yet — M1 and M2 come first.

## Next three actions

1. Resolve ISSUE-015 — separate Foxit eSign account. This gates the thesis.
   Then ISSUE-014, the Nutrient 403.
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
