# Evidence

A judge who cannot verify a claim in one click assumes it is exaggerated.
Evidence captured the moment something works is worth ten times evidence
reconstructed on deadline day.

## What must exist by submission

| Claim we make | Proof required | Status |
|---|---|---|
| The document is really generated | Captured Foxit generation response + the artifact | — |
| The agent cannot sign | The gated `run()`, plus a transcript showing the refusal | — |
| A human really signed | eSign webhook payload, timestamped, persisted | — |
| Terms are really extracted | Captured Nutrient extraction response | ✅ `nutrient-extraction-real-response.json` + the input PDF |
| Claims are really corroborated | Captured SerpApi response showing a contradiction | — |
| It runs deployed, not locally | Live URL, reachable from a phone on cellular | — |

## Layout

```
evidence/
  api/      Captured real API responses. Also the replay fixtures — see AGENTS.md § 4.
  screens/  Screenshots per milestone gate, desktop and mobile.
```

## Rules

- **Captured, never authored.** Every file in `evidence/api/` is a real response
  written verbatim. Hand-writing a plausible fixture is fabricating data.
- **Redact secrets, keep shape.** Replace key material; never reshape a payload.
- **Name by what it proves,** not by endpoint: `agent-refused-to-sign.json` beats
  `response-3.json`.
- **Log Foxit credit spend here.** 500 per year is the hard ceiling.

## Foxit credit ledger

| Date | Call | Credits | Running total |
|---|---|---|---|
| 2026-08-20 | `GET /api/tasks/{id}` auth probe ×3 | 0 | 0 / 500 |

Auth verification cost nothing: a task-status lookup authenticates without
performing billable work. Use this endpoint for any future credential check.
