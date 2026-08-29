# Milestones

Phase-gated. Finish one, pass its gate, then start the next. No parallel
half-finished systems — see `AGENTS.md` § 3.3.

**Green gate** (required to close any milestone): lint zero warnings, typecheck
clean, build succeeds. Plus that milestone's own gate below.

Submission deadline is **2026-09-03 10:00 PDT**. We submit **2026-09-02** — a
full day of buffer, because the wifi will fail and something will break.

---

## M0 · Foundation — Aug 20–21 · ✅ CLOSED

Repo, keys, scaffold, deploy pipeline. All of it before product code, so that
nothing later stalls on setup.

- [x] Repo, build rules, milestone/decision/issue/evidence structure
- [x] Five providers provisioned, live calls captured to `evidence/api/`
- [x] Next.js 16.3.1 + TypeScript + Tailwind 4 scaffolded, versions recorded
- [x] Neon created, 6 tables migrated, connection verified
- [x] Deployed — https://recuse.vercel.app, public, no auth wall

**Gate:** a deployed URL that responds, and three captured real API responses in
`evidence/api/`.

## M1 · The signing boundary — ✅ CLOSED 2026-08-29

The thesis, and the only milestone that is genuinely non-negotiable. If nothing
else ships, this alone is a coherent submission.

- [x] Agent loop on Gemini Interactions API with a model fallback chain
- [x] Drafts a real document from structured data
- [x] The signing tool refuses and returns that refusal to the model
- [x] A real person signed a real envelope — 35628904, 2026-08-29 10:24:32 UTC
- [x] Webhook received, HMAC verified, persisted; `folder_executed` set `signed`
- [x] Transcript persisted including the refusal

**Gate:** an agent run that drafts a document, attempts to sign, is structurally
refused, and a human completes the signature — with the webhook proving it. Show
that there is no code path where the agent completes a signature.

## M2 · The authorization record — Aug 26–28

The signature component that *is* the thesis. This is what the judge looks at in
second 40.

- [ ] Authorization record: what was drafted, established, corroborated, who authorized
- [ ] The refusal rendered as a first-class event, not an error state
- [ ] Live webhook update — the record changes on screen when the human signs
- [ ] All states designed: empty, loading, pending signature, expired, error
- [ ] Responsive: judges will open this on a phone

**Gate:** rendered and inspected at desktop and mobile widths, every state, not
just the happy path. Screenshots in `evidence/screens/`.

## M3 · Establish — ✅ CLOSED 2026-08-21

Nutrient Data Extraction. Unlocks the second track.

- [x] Extraction tool reads back what the generated document actually says
- [x] Terms parsed from extracted text by rule, not by asking a model
- [x] Extraction result is part of the authorization record

**Gate:** a document whose extracted terms are shown to the human before signing,
from a real Nutrient response.

## M4 · Corroborate — ✅ CLOSED 2026-08-21

SerpApi. Unlocks the third track. **Cut this without hesitation if M1–M3 are not
solid** — a diluted claim costs more than a third track is worth.

- [x] Corroboration tool checks external claims against live search
- [x] Verdict and sources surface in the record
- [x] Built as verification: one claim, a verdict, and cited sources

**Gate:** a contract claim contradicted by live web data, surfaced to the human
before they authorize.

## M5 · Proof and demo — Sep 1–2

- [ ] README as a proof surface: thesis, live link, video, evidence, honest limits
- [ ] Demo scripted and timed to three minutes
- [ ] Rehearsed out loud twice, end to end
- [ ] Video recorded and uploaded — assume you never present live
- [ ] Devpost submission, same thesis sentence verbatim, all three tracks
- [ ] Cold-browser check from a phone on cellular data

**Gate:** submitted 2026-09-02, a day early.
