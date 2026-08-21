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

## 4. Credit discipline

**Measured 2026-08-21, replacing an earlier guess.** The 500/year pool is spent
only by `create/pdf-from-html`, at 1 credit per conversion. Uploads, task
polling, failed requests, and draft eSign folders are all free. 497 remain,
which is roughly 497 more full runs — ample.

The earlier version of this rule treated credits as the scarcest resource in the
project and mandated replaying captured responses during development. That was
written before anything had been measured and it was wrong; it would have slowed
the build to protect a resource that was never at risk.

What still holds:

- **Know what bills.** Only document conversion. Probe endpoints freely — errors
  are free, and `GET /pdf-services/api/tasks/{id}` authenticates for nothing.
- **Log real spend** in `docs/EVIDENCE.md` at each checkpoint. The dashboard is
  the only place credits are visible; there is no usage endpoint.
- **`sendNow: true` is unmeasured** and emails a real person. It stays gated
  behind `RECUSE_SEND_FOR_REAL`. Measure its cost on the first live send.
- **Captured responses in `evidence/api/` are recorded truth, never invented.**
  That rule was never about credits — it is rule 3.1, and it does not relax.

Nutrient (5,000 extraction credits/month) and SerpApi (250 searches/month,
50/hr) are comfortable. Same habit, less anxiety.

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

- **shadcn/ui for primitives, our tokens for everything visible.** shadcn is
  copy-paste Radix — we own the files, so we take its behaviour and
  accessibility and restyle it completely against the design tokens. What must
  never ship is the *default* shadcn look, which is recognisable at a glance and
  puts us in the same bucket as every other entry. If a component still looks
  like stock shadcn, it is not finished.
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
