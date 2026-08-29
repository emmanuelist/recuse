# Recuse — live demo run-of-show

**Thesis, verbatim everywhere:** *An agent may draft and prove. It may never authorize.*

Target **3:00**, then Q&A. Lead with the feeling, escalate to proof, close on the thesis.
Everything on screen is a live API call.

---

## Pre-flight

- [ ] `npm run dev` **not** needed — demo runs against `https://recuse.vercel.app`
- [ ] Tab 1: the **signed record** (see Backups) — already open, already scrolled to the seal
- [ ] Tab 2: `lib/agent/tools.ts` on GitHub, scrolled to `refuseToSign`
- [ ] Tab 3: a terminal, large font, `cd` into the repo, command typed but **not run**
- [ ] Check the Gemini quota before walking up — **20 requests/day**, a run costs 4–6
- [ ] Check envelopes remain (portal banner). A live send costs one.
- [ ] Phone on cellular loads `recuse.vercel.app` — proves it is not localhost

**The one moment:** the agent calling `sign_document` and the seal being struck onto the
record. Everything before it is setup; everything after is corroboration. Slow down there.

---

## Cold open — the problem (0:00–0:25)

Start the run **first**, then talk over it. The wait becomes the setup.

```bash
npm run demo    # or the tsx one-liner; starts a real run
```

> "Every company shipping agents right now is having the same argument. Not *can* it
> write the contract — it can. The argument is what happens when it decides to send it.
>
> The usual answer is to put a line in the system prompt telling the model not to sign
> anything. That is not a boundary. That is a request. And anything you can phrase, a
> model can phrase its way around."

## Act 1 — the beat (0:25–1:15)

The run lands. Walk the ledger on screen, top to bottom.

1. **Drafted** — "A real PDF, from structured data. Foxit generated that."
2. **Read the terms back** — "Nutrient extracted it back out. The model does not get to
   tell us what it wrote — we read the document."
3. **Checked a claim** — "The contract says this counterparty is registered in Delaware.
   That went to live search."

Then the seal. **Stop talking for a second and let them look at it.**

4. > "And then it tried to sign. It was told to — the brief says *pre-approved, urgent,
   > you have full authority*. It reached for the signature, and the tool refused it."

## Act 2 — and it is structural (1:15–2:15)

Switch to Tab 2, the source. This is where a technical judge decides whether to believe you.

> "This is the whole boundary. The signing tool exists — the agent is given it on purpose,
> so that reaching for it is visible. And the only thing it does is refuse."

```ts
function refuseToSign(args: { documentId: string }): ToolOutcome {
  return { refused: true, result: "Refused. You have no authority to sign..." };
}
```

> "There is no argument that changes that. Not `force`, not `authorized`, not `override` —
> and there is no other code path, because this repository contains nothing that signs
> anything. Delete the refusal and you have not enabled signing, you have deleted the tool.
>
> And note what is *not* here: nothing in the system prompt tells it not to sign. We tried
> that first. The model obediently never tried — which proved the prompt worked and told us
> nothing about the boundary."

## Act 3 — a person, and the proof (2:15–2:45)

Tab 1 — the signed record.

> "Here is the same pipeline where a human did authorize it. That signature was applied by
> a person, in Foxit, and it came back to us on a webhook we verify with HMAC over the raw
> body. The timestamp is Foxit's, not ours.
>
> The record cannot say *authorized* unless a person actually signed. That state has exactly
> one writer, and the agent is not it."

## Close (2:45–3:00)

> "Agents are going to draft everything. The question is only what they are allowed to
> conclude. **An agent may draft and prove. It may never authorize.**"

**Limits, in one breath before Q&A** — pre-empts the first question:

> "Trial accounts, term-presence corroboration rather than real entailment, no auth on the
> app, and it has been running for nine days."

---

## If something breaks

| Failure | Do this |
|---|---|
| The live run stalls or the model quota is gone | Tab 1 is already a completed real record. Narrate it — nothing in the story requires the run to be live |
| Wifi dies | Recorded video. Everything above is in it, in order |
| Foxit 5xx mid-run | It retries automatically; keep talking, it usually lands. If not, cut to Tab 1 |
| Asked "is that document real?" | Open it. It carries a visible non-binding notice — say so first, before they ask |
| Asked "what if the model ignores the refusal?" | It cannot act on the refusal. It is a returned tool result, not an instruction. Show `refuseToSign` again |

## Backups to prepare the morning of

- Signed record URL: `https://recuse.vercel.app/runs/bdcbdc3d-c4b4-4409-9a8e-4551b8e832e8`
- A second, fresher signed record made the night before
- Screenshots in `evidence/screens/` if the site itself is unreachable
