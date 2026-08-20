# Recuse

**An agent may draft and prove. It may never authorize.**

Recuse drafts a binding document, establishes what is actually in it, corroborates
the claims it makes about the world — and then stops. A human authorizes. There is
no code path by which the agent completes a signature.

> **Status: in development.** Built for the DevNetwork [API + Cloud + AI] Hackathon
> 2026. This README becomes the proof surface at M5 — live link, demo video,
> evidence, and an honest account of the limits. It is a stub until then.

---

## How it works

| Stage | Provider | What actually happens |
|---|---|---|
| **Draft** | Foxit Document Generation | A real document is generated from structured data |
| **Establish** | Nutrient Data Extraction | The document is read back deterministically — the model does not vouch for itself |
| **Corroborate** | SerpApi | External claims are checked against live web data |
| **Authorize** | Foxit eSign | The agent routes for signature and is structurally refused. A person signs. A webhook proves it. |

## Why the boundary is structural

The signing capability is gated inside the agent tool's own `run()` function,
which returns a refusal to the model rather than performing the act. The model
can want to sign and still cannot — this is enforcement, not instruction.

## Nothing here is a mockup

Every rendered value comes from a real API response, a real database row, or a
real webhook. Captured evidence lives in [`evidence/`](evidence/), and the
constraints we build under are in [`AGENTS.md`](AGENTS.md).

## Documentation

- [`AGENTS.md`](AGENTS.md) — build rules and operating contract
- [`docs/STATE.md`](docs/STATE.md) — current truth
- [`docs/MILESTONES.md`](docs/MILESTONES.md) — phase gates
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — what was decided and why
- [`docs/RESEARCH.md`](docs/RESEARCH.md) — why this project, this event, these tracks
