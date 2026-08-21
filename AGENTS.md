# Recuse — build rules

> **An agent may draft and prove. It may never authorize.**

Read this file before touching anything. It is the operating contract for every
session. If a rule here conflicts with something you infer from the code, this
file wins — and say so rather than quietly following the code.

Current state lives in `docs/STATE.md`. Read it second, and update it before you
stop. Never let it drift: a stale STATE.md is worse than no STATE.md.

---

## 1. What we are building

Recuse is an agent that drafts a binding document, establishes what is actually
in it, corroborates the claims it makes about the world, and then **stops**.
A human authorizes. The agent never does.

Four stages, each backed by a real API:

| Stage | Provider | What it must genuinely do |
|---|---|---|
| Draft | Foxit Document Generation | Produce a real document from structured data |
| Establish | Nutrient Data Extraction | Read back what the document says, deterministically |
| Corroborate | SerpApi | Check the document's external claims against live web data |
| Authorize | Foxit eSign | Route to a human signer; a person signs; a webhook proves it |

Target: DevNetwork [API + Cloud + AI] Hackathon 2026. Submission deadline
**3 September 2026, 10:00 PDT**. Entered into the Foxit, Nutrient, and SerpApi
challenges simultaneously — the rules permit unlimited track entry.

## 2. The one inviolable rule

**There must exist no code path by which the agent can complete a signature.**

Not "the agent is instructed not to." Not "we check a flag." The authorization
boundary is structural: the signing capability is gated inside the tool's own
`run()` function, which returns a refusal to the model rather than performing
the act. The model can want to sign as much as it likes and still cannot.

If you find yourself writing a branch where the agent signs — for testing, for
convenience, for a faster demo loop — stop and raise it. That branch is the
product's entire claim, inverted.

## 3. Non-negotiables

1. **No mocks, no fake data, no demo mode.** Every value rendered in the UI comes
   from a real source: a real API response, a real database row, a real webhook.
   Judges detect fabricated data instantly and it is the most common way strong
   projects lose. See §4 for the one narrow, disciplined exception.
2. **Verify every SDK call against installed types or official docs.** Never write
   an API surface from memory. If you cannot confirm a method exists, read the
   types in `node_modules` or fetch the vendor's docs. Hallucinated SDK surfaces
   are the most expensive failure mode in a timeboxed build.
3. **Phase-gate.** Build one milestone, stop, confirm it works, then move. No
   parallel half-finished systems. `docs/MILESTONES.md` defines the order and it
   is not a suggestion.
4. **Never scope-cut silently.** If something cannot be done as specified, say so
   and present the tradeoff on technical merit. Do not quietly ship less and
   describe it as done.
5. **Green gate before any milestone closes:** lint with zero warnings, typecheck
   clean, build succeeds. A milestone with a red gate is not closed.
6. **Record evidence as you go.** See `docs/EVIDENCE.md`. Proof captured at the
   moment it works is worth ten times proof reconstructed on deadline day.

## 4. Credit discipline — read this before writing any Foxit call

**Foxit's free tier is 500 credits per YEAR**, shared across eSign, Document
Generation, and PDF Services. It is the scarcest resource in this project and it
does not refill. Careless iteration will exhaust it before demo day and there is
no recovery.

The rule:

- **Capture once, replay locally.** The first successful call to any Foxit
  endpoint gets its full real response written to `evidence/api/`. Local
  development replays that captured response.
- **Replay is captured truth, never invention.** Fixtures are recorded real
  responses, byte for byte. Writing a plausible-looking fixture by hand is
  fabricating data and violates §3.1.
- **The deployed app always calls the real API.** Replay is a local-development
  affordance only, switched by an explicit env flag that is off in production and
  off in the demo.
- **Live calls are budgeted.** Integration checkpoints and demo rehearsal only.
  Log every live call's credit cost in `docs/EVIDENCE.md`.

Nutrient (5,000 extraction credits/month) and SerpApi (250 searches/month, 50/hr)
are comfortable but not unlimited. Same habit, less anxiety.

### Verified endpoints

Confirmed against live calls on 2026-08-20. Do not guess these — the providers
run several products on adjacent paths and the wrong one returns 403, not 404.

| Stage | Endpoint | Auth |
|---|---|---|
| Draft | `POST https://na1.fusion.foxit.com/document-generation/api/generate` | `client_id` + `client_secret` headers |
| Auth probe (0 credits) | `GET https://na1.fusion.foxit.com/pdf-services/api/tasks/{id}` | same |
| Establish | `POST https://api.nutrient.io/extraction/parse` | `Authorization: Bearer pdf_live_…` |
| Authorize | eSign — separate host and credentials, see ISSUE-015 | — |

Nutrient's `/build` and `/tokens` belong to the **Processor** API and return 403
with a Data Extraction key. Extraction is multipart: `file` plus an
`instructions` field, e.g. `{"mode":"understand","output":{"format":"spatial"}}`.

## 5. Stack

- **Runtime:** Node 26.0.0, npm 11.12.1 (confirmed on this machine)
- **Framework:** Next.js, App Router, TypeScript strict mode
- **Styling:** Tailwind. **Hand-build every component.**
- **Database:** Neon Postgres (free tier, no card) via Drizzle
- **Hosting:** Vercel Hobby (free, public HTTPS — required for the eSign webhook)
- **Agent:** `@google/genai` — Gemini free tier, no card. See D006.

Resolved at install on 2026-08-20 — these are what npm actually picked, not
guesses. Do not invent version numbers; read them from `node_modules`.

| Package | Version |
|---|---|
| `next` | 16.3.1 |
| `react` | 19.2.8 |
| `typescript` | 5.9.3 |
| `tailwindcss` | 4.3.3 |
| `@google/genai` | 2.18.0 |
| `drizzle-orm` | 0.45.2 |
| `drizzle-kit` | 0.31.10 |
| `@neondatabase/serverless` | 1.1.0 |

Node 26.0.0, npm 11.12.1.

### Gemini SDK rules

Verified against Google's official function-calling and models documentation on
2026-08-20. Do not write these from memory — this SDK was renamed and the API
surface changed, so recalled patterns are very likely wrong:

- **Package: `@google/genai`.** The older `@google/generative-ai` is
  **deprecated and out of support**. If you find yourself importing it, or
  reaching for `GoogleGenerativeAI`, stop — that is stale training data.
- **Import and client:**
  `import { GoogleGenAI } from "@google/genai";` then `new GoogleGenAI({})`,
  which reads the key from the environment.
- **Model: `gemini-3.7-flash`.** Google describes it as built for "agentic
  workflows and reliable multi-step execution", which is exactly this pipeline.
  Do not use `gemini-2.5-flash` — still available, but several generations old.
- **Use the Interactions API**, now GA and the route to current models:
  `await client.interactions.create({ model, input, tools })`.
- **Tool declarations** are plain objects with `type: "function"`, `name`,
  `description`, and a JSON-Schema `parameters` object. Not Zod, not a helper.
- **Read tool calls** by walking `interaction.steps` and matching
  `step.type === "function_call"` — then `step.name`, `step.arguments`, `step.id`.
- **Return results** as an input block of `type: "function_result"` carrying
  `name`, `call_id` (the step's `id`), and `result`, together with
  `previous_interaction_id` to continue the same interaction. Conversation state
  is held server-side by that id — do not rebuild history by hand.
- **The signing gate lives in the handler for the signature tool**, which returns
  a refusal as its `function_result` instead of performing the act. The model
  receives a refusal and cannot proceed. This is §2, and it is the whole product.
- **Parse tool arguments** rather than string-matching the serialized form.
- **Free-tier limits are account-specific** and are not published in the docs.
  Read yours at https://aistudio.google.com/rate-limit before demo day, and
  design the agent to survive a 429 mid-run rather than assuming headroom.

## 6. Interface

The interface is the tiebreak. Most entrants leave it to a component library and
land in the same visual bucket as thirty other submissions.

- **No component library.** No shadcn, no MUI, no DaisyUI. Tailwind, an icon set,
  `clsx`, and hand-built components. The winning repos carry almost no UI deps.
- **One signature component that *is* the thesis** — the authorization record
  showing what was drafted, what was established, what was corroborated, and who
  authorized it. Not decoration: the claim rendered as an object on screen. It is
  what the demo points at and what a judge remembers.
- **Design for the beat.** Ask what the judge is looking at in second 40 of the
  demo, build that element first, and make it unmissable.
- **Real content, real states.** Empty, loading, error, long values, missing data,
  a signature that never comes back. Design them; do not discover them live.
- Establish product-specific art direction before significant
  UI work; hold a premium bar rather than shipping a default look.

## 7. Prohibitions

- No `demo mode`, `USE_MOCK`, seeded-looking fake records, or lorem ipsum.
- No hand-written API fixtures. Captured real responses only.
- No signing path for the agent, under any flag, for any reason.
- No component library for UI.
- No claiming an integration that is only imported. If it is in the README, it runs.
- No secrets in the repo. `.env.local` is gitignored; `.env.example` carries names only.
- No force-push to `main`. No commit or push unless asked.

## 8. Working rhythm

Start of session: read `docs/STATE.md`, then `docs/MILESTONES.md` for the current
gate. End of session: update `docs/STATE.md`, log any decision in
`docs/DECISIONS.md`, file anything discovered-but-not-fixed in `docs/ISSUES.md`.

Decisions get recorded when they are made, not reconstructed later. If you chose
between two approaches and it was not obvious, it is a decision — write it down.
