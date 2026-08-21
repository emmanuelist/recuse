# Evidence

A judge who cannot verify a claim in one click assumes it is exaggerated.
Evidence captured the moment something works is worth ten times evidence
reconstructed on deadline day.

## What must exist by submission

| Claim we make | Proof required | Status |
|---|---|---|
| The document is really generated | Captured Foxit generation response + the artifact | ✅ `foxit-draft-real-response.json` |
| The agent cannot sign | The gated handler, plus a transcript showing the refusal | ✅ `m1-agent-transcript.json` |
| A human really signed | eSign webhook payload, timestamped, persisted | ⏳ endpoint live and verified (`webhook-live-verification.txt`); awaiting a real signature |
| Terms are really extracted | Captured Nutrient extraction response | ✅ `nutrient-extraction-real-response.json` + the input PDF |
| Claims are really corroborated | Captured SerpApi response showing a contradiction | — |
| It runs deployed, not locally | ✅ https://recuse.vercel.app — verified public. Phone-on-cellular check still owed at M5. |

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

## Webhook payload shape

Confirmed against the Foxit API reference 2026-08-21. The handler originally
read `event` and `folder.folderId` at the top level and would have matched
nothing on the first genuine signature — a failure that only shows up on demo
day.

```json
{ "event_name": "folder_signed",
  "event_date": 1464237988093,
  "data": { "folder": { "folderId": 649, "folderStatus": "SHARED" },
            "signing_party": { "emailId": "..." } } }
```

## Foxit credit ledger

Measured from the dashboard, which is the only place credits are visible.

| Checkpoint | Requests | Succeeded | Credits used |
|---|---|---|---|
| After endpoint probing | 20 | 1 | **0** |
| After 3 document generations | 49 | 25 | **3** |

**What actually bills: `create/pdf-from-html`, at 1 credit per conversion.**
Three conversions succeeded between those two readings and exactly three credits
were consumed.

Free, confirmed by the same arithmetic:
- every failed request — 24 failures across both readings cost nothing
- `documents/upload`
- `tasks/{id}` polling, which runs 5–8 times per draft
- `esign/folders/createfolder` with `sendNow: false`

**497 credits remain ≈ 497 more full document generations.** This is not a
binding constraint for a 13-day build.

**Still unmeasured:** `sendNow: true`. A live send that emails a human may bill
differently. Measure it on the first real send, not on demo day.
