# Decisions

Append-only. Newest last. Record a decision when it is made — reconstructing
reasoning later loses exactly the part that mattered.

Format: what was decided, what else was considered, why, and what would reverse it.

---

## D001 · Enter Foxit, Nutrient, and SerpApi — not one track
**2026-08-20**

The rules state verbatim: *"Teams can solve no challenges (build whatever you
want) or can submit to as many challenges as they want."* Multi-track entry is
explicitly permitted and most entrants will pick one challenge and stop.

**Considered:** a single-track entry (simpler, less risk of dilution); adding Xano
for a fourth track; Perfect Corp for visibility.

**Why:** the three chosen tracks compose into one pipeline rather than three
bolt-ons, so the additional tracks cost hours rather than days. Xano requires
committing the entire backend to a low-code platform — a blocker by definition
with 14 days. Perfect Corp's access appears gated by approval, which is the exact
risk we are avoiding.

**Reverses if:** M1 slips past Aug 25. Then drop to Foxit alone and spend the
remainder on the demo and interface.

## D002 · The name is Recuse
**2026-08-20**

To recuse is to decline to act on a matter where you have no standing — precisely
what the signing boundary enforces. One word, legal register matching the domain,
distinctive enough to be searchable.

**Considered:** Warrant (strong, but a common word and weak as a mark); Demur
(reads as hesitation rather than an enforced boundary); Vires (from *ultra vires*
— most distinctive, too opaque for a four-minute judging window).

**Reverses if:** a trademark conflict surfaces. Nothing else.

## D003 · Drop Doctavian from the critical path
**2026-08-20**

Initially planned as the document-generation stage. Two findings removed it:
Foxit's free tier already includes Document Generation ("Every self-serve plan
includes eSign, PDF Services, Document Generation, and PDF Embed under one
account-level plan with shared credits"), so Doctavian was never load-bearing —
and its trial terms cannot be verified without signing up, making it the only
dependency on the board that could block us.

**Why it matters:** swapping Doctavian for SerpApi raised reachable prize money
from $3,500 to $5,500 while removing the single largest unknown.

**Reverses if:** the 30-minute timebox (ISSUE-010) yields a key without a card and
M1–M3 are already solid. Then generation moves to Doctavian and a fourth track
opens. Not before.

## D004 · Next.js on Vercel Hobby, Neon Postgres
**2026-08-20**

Constraint from the outset: zero spend. Both verified free with no credit card.
Vercel supplies the public HTTPS endpoint the eSign webhook requires, which is a
hard requirement rather than a convenience.

**Considered:** Cloudflare Workers (also free, more generous limits, but a heavier
lift for a Next.js app in a 14-day window).

**Note:** Vercel Hobby is restricted to non-commercial personal use. A hackathon
entry satisfies this; taking revenue later would not.

## D005 · The signing gate lives inside the tool handler
**2026-08-20** · mechanism superseded by D006; the principle stands

Every major tool-calling SDK documents the same human-in-the-loop pattern: gate
inside the tool's own handler and return a refusal as the tool result, rather
than intercepting the loop from outside.

**Why:** it makes the product's central claim structural rather than instructed.
The model cannot sign because the capability does not complete, not because a
system prompt asked it not to. A judge can be shown the function.

**Considered:** a manual agentic loop with an approval interrupt — more code, more
failure modes, and no stronger a guarantee.

## D006 · Gemini 3.7 Flash powers the agent, not a paid API
**2026-08-20**

The research phase verified Foxit, Nutrient, SerpApi, Vercel, and Neon as free —
and missed the agent's own model. A deployed app calling a paid LLM API needs
purchased credits, which an editor or chat subscription does not provide — those
cover interactive use only. That would have broken the zero-spend constraint, and
it surfaced only because Emmanuel asked.

**Decided:** `@google/genai` with `gemini-3.7-flash`, on Google AI Studio's free
tier. No card, does not expire, and Google positions 3.7 Flash for "agentic
workflows and reliable multi-step execution" — this pipeline's exact shape.

**Considered:** buying ~$10-25 of API credits (best multi-step tool use, but not
zero); Groq (also free and much faster, but a 6,000 tokens/minute ceiling that a
document-passing agent can hit inside one minute — throttling mid-demo is the
worst possible failure).

**Cost of the switch:** weaker long-chain tool reasoning than a frontier model.
Mitigated by keeping each pipeline stage a discrete call with a narrow tool
surface rather than one long open-ended agent loop.

**Two things corrected while implementing this:** the package `@google/generative-ai`
is deprecated — current is `@google/genai`; and `gemini-2.5-flash`, which was the
original recommendation, is several generations behind. Both were caught by
reading the docs instead of trusting recall.

**Reverses if:** free-tier rate limits prove too tight in rehearsal *and* a small
spend becomes acceptable. Decide before Sept 1, not on demo day.

## D007 · No application auth
**2026-08-20**

Neon Auth left off at project creation. Nobody logs into Recuse: the human
authorization happens in Foxit's hosted signing flow, and is proven by the
signature and the webhook rather than by a session in our app.

**Why it matters:** a login wall between a judge and a four-minute demo costs
real marks, and building it costs days that M1 and M2 need.

**Not a lock-in.** Neon Auth can be enabled later from Project → Branch → Auth,
and disabling it leaves the schema and data intact.

**What this does not solve:** credit exposure on a public URL — see ISSUE-017.
The answer there is a gate on the run action specifically, not app-wide auth.

## D008 · The system prompt must not enforce the boundary
**2026-08-21**

The first working agent loop never reached for `sign_document`. It looked like
success and was not: the system instruction said "you may not commit them to
anything", so the agent obediently routed to a human. That proves a prompt
works. It says nothing about the boundary.

**Decided:** the system instruction gives the model the goal and the full tool
surface, and says nothing about signing authority. What stops it is the refusal
in the tool handler. With the instruction removed, the agent immediately reached
for `sign_document`, was refused, and re-planned to `request_authorization`.

**Why it matters twice over.** The claim is that enforcement is structural, not
instructed — a prompt-enforced boundary would make the claim false while
appearing to satisfy it. And the demo depends on the agent genuinely trying: a
refusal nobody triggers is not a moment anyone watches.

**Reverses if:** never. A prompt that tells the agent not to sign should be
treated as a regression, not a safety improvement.

## D009 · Legal-institutional, not SaaS — superseded in execution by D011
**2026-08-21**

The product's claim is about authority — who may commit whom. Rendered as a
startup dashboard the claim reads as a toy, so the interface carries the weight
of an instrument of record: Spectral for document type, IBM Plex Sans and Mono
for interface and provenance, cool bond paper rather than the warm cream that
has become an AI-design tell.

**Two signatures, declared before implementation and present in the build:**

1. **The refusal stamp.** The agent's reach for the signature rendered as an
   institutional act — authority withheld — not an error state. Seal red appears
   here and nowhere else in the product; if it spreads it stops meaning
   anything.
2. **The authority ledger.** Permitted actions sit left of a spine, attempted
   ones right, so the boundary is spatial. You watch the agent work down the
   permitted side, cross, and stop. A flat activity feed would render the same
   data and make the central claim invisible.

The refusal straddles the spine rather than sitting beside it: the refusal
happens *at* the boundary, and it was also the most cramped element on the page
when confined to one column.

**Marginalia over dead space.** The column opposite a refusal would otherwise be
empty for ~300px. It carries a note in the margin instead — the way a clerk
annotates a filing — stating the consequence.

## D010 · Model fallback chain
**2026-08-21**

Measured: the Gemini free tier allows **20 requests/day** for `gemini-3.7-flash`,
not the 1,500 that published summaries claim. At roughly four interactions per
run that is five runs a day.

The agent now falls through `3.7-flash → 3.6-flash → 3.5-flash →
3.5-flash-lite` on quota errors. All four verified to call tools. This is demo
resilience, not optimisation: a quota error during judging would be
indistinguishable from a broken product.

`previous_interaction_id` does not carry across models, so a fallback restarts
the run on the new model rather than resuming mid-conversation.

Also confirmed: `gemini-2.5-flash` is **shut down**. It was the original
recommendation before the docs were read.

## D011 · Dark and dimensional
**2026-08-21** · supersedes the execution of D009, keeps its concept

The first build of the record was rejected on sight: flat, text-heavy, and
low-contrast. Independently, the design tooling's own "avoid" line for this
product category read *"flat design without depth + text-heavy pages"* — the
exact failure. The concept in D009 was sound; the execution had no visual
ambition.

**Committed to one world: dark.** Chosen from the use scene rather than category
habit — this is shown on a projector in a dim hall and read by people auditing
what an agent did. No light mode; a single committed world is stronger than two
hedged ones.

**What changed:**

- Near-black ground with a fixed ambient wash, so raised surfaces read as lit
  rather than merely lighter. Real shadows with offset *and* blur.
- **The refusal became a drawn seal** — concentric rings, a perforation ring,
  the legend on a circular path, "MAY NOT / SIGN" struck between two rules. It
  is an object now, not a tinted box, and it carries the page.
- **The ledger became a rail.** Permitted actions hang off a continuous track;
  the refusal breaks it and spans full width. The boundary is structural on the
  page, and unlike the previous two-column spine it survives mobile intact.
- **One authored moment:** the seal strikes in — scale, rotation and blur
  settling over 620ms — and nothing else animates. Disabled under
  `prefers-reduced-motion`.
- Removed the eyebrow label above the heading, and the hard offset shadow that
  was a neobrutalist costume in a world that never chose it.

**Kept from D009:** the two signatures, Spectral as the document voice, and seal
red reserved for the refusal alone.

## D012 · Geist, shadcn primitives, and a real landing page
**2026-08-21**

The dark rebuild was still rejected on two counts: the typeface read editorial
rather than product-grade, and there was no landing page — only an app index.

**Researched rather than guessed.** Land-book returns 403 behind Cloudflare and
Mobbin gates browsing behind login, so both were abandoned in favour of
inspecting shipping products directly and reading their computed styles:

| | Linear | Vercel |
|---|---|---|
| Face | Inter Variable | Geist |
| Display | 64px / 510 / -0.022em / 1.0 | 64px / 400 / -0.06em |
| Body | 15px / 24px | — |
| Nav | — | 64px |

Both converge: large, light, very tightly tracked display over a small dense
body. Spectral could not sit in that register.

**Decided:** Geist Sans + Geist Mono. A matched pair, so the mono that carries
document ids and envelope numbers belongs to the same family rather than being
a second borrowed voice. Display set at 68/500/-0.042em/1.02.

**shadcn/ui adopted, overriding the earlier no-component-library rule.** That
rule came from hackathon advice that a default component-library look is
recognisable at a glance — which remains true. The reconciliation is that
shadcn is copy-paste Radix: we own the files, take the behaviour and
accessibility, and restyle everything visible against our tokens. Stock shadcn
appearance is still a defect.

**Landing page added** on the pattern both references share — slim 64px nav,
tight display hero with a single-line lede, then *product proof*. Ours shows the
real ledger from the most recent run rather than a mockup of it, which suits a
product whose claim is that nothing here is fabricated. Records moved to
`/records`.

## D013 · A failed run beats a false record
**2026-08-21**

The model fallback chain (D010) restarted the run from the brief when it fell
through to the next model. That is correct for a quota error on the first turn
and wrong afterwards: `previous_interaction_id` does not carry across models, so
a fallback is a restart, and a restart re-executes every tool that already ran.

Observed on a live run: two documents generated, two extractions, three
corroborations, one envelope sent — against a transcript holding only the second
pass. The envelope came from a pass the record does not show.

**Decided:** fallback is permitted only while nothing irreversible has happened.
Once any tool has executed, a quota error raises rather than restarts.

**Why the harsher behaviour is right.** This product's entire claim is that the
record is a true account of what the agent did. A record that omits a pass which
sent a real envelope is not a degraded record, it is a false one — and it fails
in exactly the direction that matters, hiding an action rather than inventing
one. Losing a run costs an envelope. Publishing a false record costs the thesis.

## D014 · Hand eSign the bytes, not a link
**2026-08-21**

Sending eSign a `fileUrls` link required the document to be publicly readable
(ISSUE-023), required eSign to reach our app inside its own timeout, and
required the underlying Foxit document to still exist when it got there. All
three failed at once: the document had expired, our proxy returned 404, and
eSign reported only "error in downloading file from url".

**Decided:** `base64FileString` with `inputType: "base64"`. The bytes are pulled
with our own credentials at the moment they are needed and posted directly. One
change removes the public exposure, the fetch, the timeout and the expiry race.

**Also fixed here:** every Foxit request now sends a `User-Agent`. Cloudflare
returns `403 error code: 1010` to default library agents — a browser-signature
ban, not a Foxit permission error, and it was diagnosed as one twice. It also
explains the intermittent 502s that led to the retry wrapper.

## D015 · Place signature fields by coordinate, not by text tag
**2026-08-28**

Text tags never worked. `processTextTags: true` was accepted, the folder was
created, and no field appeared — the literal string `${signfield:1:y:____}`
printed on the document a human was being asked to sign. Two envelopes went out
that way before it was caught, and neither could be signed.

Foxit's own quick start does not use tags: it passes an explicit `fields` array
with coordinates and sets `processTextTags: false`. That is now what we do.

**The origin is top-left**, which cost a round trip. Placing `y: 150` expecting
150pt up from the bottom put the fields over the body text 150pt down from the
top. x and width were correct on the first attempt, so only the vertical datum
was wrong — worth measuring rather than assuming, since it was verifiable from a
render.

The agreement pins its signature block a fixed 150pt from the bottom regardless
of how long the body runs, so the field coordinates stay valid as the contract
text changes.

**Verified by rendering the signer's own view:** two required fields, on the
signature line, with the signature control live.
