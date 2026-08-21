# Issues

Anything discovered but not fixed goes here immediately — an issue written down
is worth more than one remembered. Close by moving to Closed with a one-line
outcome.

`P0` blocks a milestone gate · `P1` needed for submission · `P2` improves the odds

---

## Open

| ID | P | Milestone | Issue |
|---|---|---|---|
| ISSUE-001 | P0 | M0 | Provision Foxit developer key. Free, no card, ~5 min. Capture first real response to `evidence/api/foxit-*.json`. Note the credit cost. |
| ISSUE-002 | P0 | M0 | Provision Nutrient DWS key. Free plan, no card. Use **Data Extraction** (5,000 credits/mo, unwatermarked), not Processor (50/mo, watermarked). |
| ISSUE-003 | P0 | M0 | Provision SerpApi key. Free tier 250 searches/mo, 50/hr. Respect the hourly cap during rehearsal. |
| ISSUE-012 | P0 | M0 | Provision Gemini key at aistudio.google.com/apikey. Free, no card. Confirm `gemini-3.7-flash` responds and supports the tool surface we need. |
| ISSUE-013 | ✅ | M4 | Read actual free-tier rate limits at aistudio.google.com/rate-limit — they are account-specific and unpublished. Make the agent survive a 429 mid-run rather than assuming headroom. |
| ISSUE-016 | P1 | M5 | Rotate all credentials after submission — four API keys and the Neon database password were pasted into a chat transcript. Free-tier keys are low blast radius, but `AIza…` keys get scraped aggressively and the DB password grants full write access. |
| ISSUE-017 | P1 | M2 | **Public demo URL can drain Foxit credits.** 500/year total, and one pipeline run spends several. An unauthenticated "run the agent" button on a public link is a credit-drain vector — a handful of curious visitors could exhaust the year before judging. Fix with a gate on the live-run action, NOT app-wide auth: the read path shows real completed runs from the database, and only triggering a new run is limited. |
| ISSUE-018 | P0 | M1 | Run the draft stage end to end for the first time. Costs credits — record the before/after balance from the Foxit dashboard to establish per-run cost against the 500/year pool. |
| ISSUE-020 | P1 | M1 | Upload→convert race: the first draft attempt returned `DOCUMENT_NOT_FOUND` for a documentId that had just been created, then succeeded on retry. `fetchWithRetry` only handles 5xx, so this 404 is unhandled. Add a short bounded retry for DOCUMENT_NOT_FOUND specifically. |
| ISSUE-021 | P2 | M2 | Draft stage takes ~14s end to end (upload, convert, poll). Too long to sit on a blank screen during a 3-minute demo — M2 must show the pipeline progressing, not a spinner. |
| ISSUE-022 | P0 | M1 | Register the webhook in the eSign portal (Configure Webhooks) with URL `https://recuse.vercel.app/api/webhooks/foxit` and the generated secret. Until this is done no real signature can reach the app. |
| ISSUE-023 | P1 | M2 | `/api/documents/[foxitId]/pdf` is public read access to generated documents. eSign must fetch them and cannot authenticate to Foxit, so this is required — but ids are the only protection. Acceptable for the hackathon; note it in the README limits section. |
| ISSUE-024 | P1 | M5 | Gemini free tier is 20 req/day on the preferred model. Do not rehearse the full pipeline repeatedly on demo day — the fallback chain covers one exhaustion, not five. |
| ISSUE-004 | P0 | M0 | Scaffold Next.js + TS strict + Tailwind. Pin resolved versions into `AGENTS.md` § 5. No component library. |
| ISSUE-005 | P0 | M0 | Deploy to Vercel, confirm public HTTPS POST endpoint reachable. The eSign webhook depends on this existing before M1. |
| ISSUE-006 | P1 | M0 | Email Foxit and Nutrient for hackathon keys — clears TEST-mode watermark, may lift the 500-credit ceiling. Sponsors usually have them and almost nobody asks. |
| ISSUE-007 | P1 | M1 | Foxit eSign webhook needs signature verification. Do not trust an unverified inbound POST that mutates authorization state. |
| ISSUE-008 | P1 | M2 | Design the never-signed state: envelope sent, human never acts. It is the most likely real-world outcome and the easiest state to forget. |
| ISSUE-009 | P2 | M5 | Repo must be public and named `recuse` for judges. Local directory is `devnetwork` — pass the name explicitly to `gh repo create`. |
| ISSUE-010 | P2 | — | Doctavian 30-minute timebox. Key without a card → fourth track, $1,000. Otherwise walk away. Only after M1–M3 are solid. |
| ISSUE-011 | P2 | M4 | Guard against SerpApi drifting into "the agent can also search". If it stops being verification, cut it — see `docs/MILESTONES.md` M4. |

## Closed

| ID | Outcome |
|---|---|
| ISSUE-019 | **Done.** Webhook route live and verified in production: fails closed with no secret, rejects unsigned, wrong-key, tampered and truncated signatures, accepts only a correct HMAC-SHA-256 over the raw body. Only `folder_executed` sets "signed". |
| ISSUE-015 | **Diagnosis was wrong — no separate credentials exist.** eSign runs on the same `na1.fusion.foxit.com` host with the same `client_id`/`client_secret`. It needed one-time *activation* (eSign API → Activation, US storage), which was itself gated on setting a company name in the Foxit account profile. Account #2905053, US Region. Verified: correct credentials return 404 on a guessed path, a wrong secret returns 401 — so auth passes. Control captured to `evidence/api/`. |
| ISSUE-014 | **Not a real issue — my diagnosis was wrong.** The key was valid the whole time with 5,000/5,000 credits. The 403 came from calling `/build` and `/tokens`, which are *Processor* API endpoints, with a *Data Extraction* key. Correct endpoint is `POST /extraction/parse`. Verified with a real contract PDF: counterparty, fee, term dates, and clause roles all extracted correctly. Response captured to `evidence/api/`. Cost 1 of 5,000 credits. |
