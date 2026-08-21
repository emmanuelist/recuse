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
| ISSUE-013 | P1 | M4 | Read actual free-tier rate limits at aistudio.google.com/rate-limit — they are account-specific and unpublished. Make the agent survive a 429 mid-run rather than assuming headroom. |
| ISSUE-014 | P0 | M0 | **Nutrient key returns 403 Forbidden** on every real endpoint (`/build`, `/tokens`); 404 on fake ones, so routing is fine and the key itself is being rejected. Likely needs plan activation or per-API enablement at dashboard.nutrient.io. Blocks M3. |
| ISSUE-015 | P0 | M1 | **Foxit eSign needs its OWN credentials.** The developer-portal client_id/secret authenticate PDF Services and Document Generation only — Foxit documents that eSign runs on a separate host (`na1.foxitesign.foxit.com`) with its own API Key and Secret. Separate signup required. Blocks the thesis. |
| ISSUE-016 | P1 | M5 | Rotate all API keys after submission — they were pasted into a chat transcript. Free-tier keys, low blast radius, but `AIza…` keys get scraped aggressively. |
| ISSUE-004 | P0 | M0 | Scaffold Next.js + TS strict + Tailwind. Pin resolved versions into `AGENTS.md` § 5. No component library. |
| ISSUE-005 | P0 | M0 | Deploy to Vercel, confirm public HTTPS POST endpoint reachable. The eSign webhook depends on this existing before M1. |
| ISSUE-006 | P1 | M0 | Email Foxit and Nutrient for hackathon keys — clears TEST-mode watermark, may lift the 500-credit ceiling. Sponsors usually have them and almost nobody asks. |
| ISSUE-007 | P1 | M1 | Foxit eSign webhook needs signature verification. Do not trust an unverified inbound POST that mutates authorization state. |
| ISSUE-008 | P1 | M2 | Design the never-signed state: envelope sent, human never acts. It is the most likely real-world outcome and the easiest state to forget. |
| ISSUE-009 | P2 | M5 | Repo must be public and named `recuse` for judges. Local directory is `devnetwork` — pass the name explicitly to `gh repo create`. |
| ISSUE-010 | P2 | — | Doctavian 30-minute timebox. Key without a card → fourth track, $1,000. Otherwise walk away. Only after M1–M3 are solid. |
| ISSUE-011 | P2 | M4 | Guard against SerpApi drifting into "the agent can also search". If it stops being verification, cut it — see `docs/MILESTONES.md` M4. |

## Closed

_None yet._
