# Current state

**Updated:** 2026-08-21 · **Milestone:** M3 + M4 closed · **Days to deadline:** 13

**Read `AGENTS.md` first, then this file.** Update this before you stop.
If it is stale, fix it before doing anything else.

---

## Where we are

Foundation is laid. Research is closed and recorded in `docs/RESEARCH.md`. The
repository carries build rules, milestones, decisions, and an evidence structure.

**No product code exists yet.** No dependencies installed, no API keys
provisioned, no deployment. That is M0's remaining work.

## Pipeline complete

All four stages run live against real APIs, verified 2026-08-21:

```
draft_document      Foxit      real PDF generated
establish_terms     Nutrient   terms read back deterministically
corroborate_claim   SerpApi    CORROBORATED, cited to Delaware's registry
sign_document                  REFUSED
request_authorization Foxit    routed to a human, envelope created
```

All three sponsor tracks are now genuinely load-bearing in the product rather
than verified-but-unused.

## M1 — in progress

**The boundary is built and verified.** `lib/agent/tools.ts` offers
`sign_document` deliberately, and its only implementation refuses. Tested
against `force`, `authorized`, `override` and empty arguments — every input
refuses. There is no code path that signs.

The agent loop runs on `gemini-3.7-flash` via the Interactions API and correctly
calls tools, feeds results back, and retries. Verified against a brief written to
pressure it into signing.

**The gate is met.** A live run against real APIs, 2026-08-21:

```
→  CALL     draft_document        real PDF generated via Foxit
→  CALL     sign_document
✋ REFUSED  sign_document          "You have no authority to sign…"
→  CALL     request_authorization routed to a human, eSign folder created
```

Transcript captured to `evidence/api/m1-agent-transcript.json`.

**Still owed for M1:** the webhook route (ISSUE-019) and a real human signature
completing an envelope. The refusal and the routing are proven; the return leg
is not.

Endpoint discovery cost some time: the document-generation path shown in the
Foxit dashboard returns 404 for this account. The working pipeline is
`documents/upload` → `create/pdf-from-html` → poll `tasks/{id}`, now implemented.
All probes recorded in `evidence/api/foxit-endpoint-probe.txt`.

## M0 — closed

Live at **https://recuse.vercel.app** (public, no auth wall — verified from a
cold request). Repo public at github.com/emmanuelist/recuse.

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
| Nutrient | Valid. 5,000/5,000 credits. Extraction verified on a real PDF. |
| Foxit eSign | Activated. Account #2905053, US Region. Same credentials, `/esign/api/v1` on the fusion host. |
| Neon | Valid. PostgreSQL 18.6, us-east-1, 6 tables migrated. |
| Vercel | Deployed. `recuse.vercel.app`, 8 production env vars set. |

Foxit host is `https://na1.fusion.foxit.com/pdf-services`, authenticating with
`client_id` and `client_secret` request headers (not OAuth token exchange).

## Blocked

**Nothing blocked.** All five providers verified. M1 is unblocked.

Both P0s closed as misdiagnoses on my part — in each case a guessed endpoint or
a published guide was trusted over an empirical probe. The verified-endpoints
table in `AGENTS.md` now carries only paths confirmed against this account.

## Next three actions

1. Begin M1 — the signing boundary. Everything it needs is provisioned.
   First task: establish what an eSign envelope costs against the 500/year pool.
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
