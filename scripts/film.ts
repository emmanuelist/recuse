/**
 * Films the demo.
 *
 * This automates the CAMERA, not the content. Every frame is the real app,
 * driven by the real engine, against real Somnia markets. Nothing is stubbed
 * and no footage is synthesised. What it buys is determinism: exact beats,
 * no mouse fumbling, and a re-run if anything changes.
 *
 * Segments map to docs/run-of-show.md. Record voice separately, then:
 *   npm run film:cut          # assemble segments
 *   npm run film:voice a.m4a  # mux narration over the cut
 *
 *   npm run film              # needs `npm run serve -- --live --short` warm
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { CUES, CAPTION_RUNTIME } from "./captions.js";
import { MOVES, POINTER_RUNTIME, TRAVEL_MS, type Move } from "./pointer.js";
import { NARRATION } from "./narration.js";
import { CARDS, cardHTML, type Card } from "./card.js";
import { readFileSync, existsSync } from "node:fs";

/** Each segment runs as long as its narration actually takes, plus a tail to
 *  let the last line land. Hand-tuned windows break the moment the voice
 *  changes pace, and swapping TTS voices changes it a lot. */
const TAIL = 4.5;
function windowFor(segment: string, planned: number): number {
  if (!existsSync("film/timing.json")) return planned;
  try {
    const t = JSON.parse(readFileSync("film/timing.json", "utf8")) as
      Record<string, { at: number; secs: number }[]>;
    const lines = t[segment];
    if (!lines?.length) return planned;
    const last = lines[lines.length - 1]!;
    return Math.round((last.at + last.secs + TAIL) * 10) / 10;
  } catch { return planned; }
}

// Filmed against a local production build: identical code and the same
// database as the deployed site, but reachable from the recording browser.
const SITE = process.env.SITE_URL ?? "http://localhost:3100";
const RECORD = process.env.RECORD_URL ??
  "http://localhost:3100/runs/bdcbdc3d-c4b4-4409-9a8e-4551b8e832e8";
const OUT = "film";
const W = 1440, H = 900;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wait until the page actually has content. Fixed sleeps guess; this checks.
 *  The Somnia explorer takes ~14s to paint and ~22s to settle, so a 4s sleep
 *  filmed a blank white page. */
async function untilPainted(page: Page, minChars = 400, timeoutMs = 40_000) {
  const t0 = Date.now();
  for (;;) {
    const n = await page.evaluate(() => (document.body?.innerText ?? "").trim().length).catch(() => 0);
    if (n >= minChars) { process.stdout.write(`  painted (${n} chars, ${((Date.now() - t0) / 1000).toFixed(1)}s)\n`); return; }
    if (Date.now() - t0 > timeoutMs) { process.stdout.write(`  ! never painted after ${timeoutMs / 1000}s\n`); return; }
    await wait(500);
  }
}

/** Roll for `secs` of PAINTED footage, after setup.
 *
 *  The browser shows white while it navigates and loads, so those frames are
 *  unusable. Counting them toward the window left the landing segment with 5s
 *  of real footage for 17s of narration. So: hold the full window after setup,
 *  record how long setup took, and let the cut trim it away. What survives is
 *  exactly `secs` of painted picture. */
const setupTimes: Record<string, number> = {};
async function holdAfterSetup(name: string, startedAt: number, secs: number) {
  const spent = (Date.now() - startedAt) / 1000;
  setupTimes[name] = +spent.toFixed(2);
  process.stdout.write(`  setup ${spent.toFixed(1)}s (trimmed), rolling ${secs}s of picture\n`);
  await wait(secs * 1000);
}

/** Captions are injected AFTER the page settles, so their clock starts when
 *  the shot actually begins rather than when navigation did. */
/**
 * Fire the real interactions, timed to when the cursor ARRIVES rather than when
 * it sets off. A click that lands before the cursor gets there reads as the page
 * acting on its own; landing after it reads as the cursor causing it.
 *
 * Failures are logged and swallowed: a selector can vanish between planning and
 * filming, and losing one interaction is better than losing the segment.
 */
function scheduleActions(page: Page, moves: Move[]): NodeJS.Timeout[] {
  const timers: NodeJS.Timeout[] = [];
  for (const m of moves) {
    if (!m.click && m.type === undefined) continue;
    timers.push(setTimeout(async () => {
      try {
        await page.evaluate(() => (window as unknown as { __ptrPress?: () => void }).__ptrPress?.());
        const el = page.locator(m.sel).first();
        if (m.type !== undefined) { await el.click({ timeout: 2500 }); await el.fill(m.type as string, { timeout: 2500 }); }
        else { await el.click({ timeout: 2500 }); }
        process.stdout.write(`    acted on ${m.sel}\n`);
      } catch (e) {
        process.stdout.write(`    action skipped (${m.sel}): ${((e as Error).message.split("\n")[0] ?? "").slice(0, 60)}\n`);
      }
    }, m.at * 1000 + TRAVEL_MS));
  }
  return timers;
}

async function captions(page: Page, name: string) {
  const cues = CUES[name];
  if (cues?.length) {
    try {
      await page.evaluate(CAPTION_RUNTIME.replace("__CUES__", JSON.stringify(cues)));
      process.stdout.write(`  captions: ${cues.length} cues injected\n`);
    } catch (e) { process.stdout.write(`  captions FAILED: ${(e as Error).message.slice(0, 90)}\n`); }
  }
  const moves = MOVES[name];
  if (moves?.length) {
    try {
      await page.evaluate(POINTER_RUNTIME.replace("__MOVES__", JSON.stringify(moves)));
      const ok = await page.evaluate(() => !!document.getElementById("__ptr"));
      const acts = moves.filter((m) => m.click || m.type !== undefined).length;
      const zooms = moves.filter((m) => m.zoom !== undefined).length;
      process.stdout.write(`  pointer: ${moves.length} moves, ${acts} actions, ${zooms} zooms, element ${ok ? "present" : "MISSING"}\n`);
      scheduleActions(page, moves);
    } catch (e) { process.stdout.write(`  pointer FAILED: ${(e as Error).message.slice(0, 90)}\n`); }
  } else {
    process.stdout.write(`  pointer: no moves for ${name}\n`);
  }
}

async function segment(name: string, secs: number, go: (p: Page) => Promise<void>) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: `${OUT}/${name}`, size: { width: W, height: H } },
    deviceScaleFactor: 1,
    // The Somnia explorer is light-themed by default and flashed a full white
    // frame at the end of the film. It honours prefers-color-scheme.
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  // Recording starts with the context, so the first frames were about:blank
  // white. Paint the ground before navigating anywhere.
  await page.goto("data:text/html,<body style=\"margin:0;background:#08090b\"></body>");
  const startedAt = Date.now();
  console.log(`\n▸ ${name}`);
  await go(page);
  await captions(page, name);
  await holdAfterSetup(name, startedAt, secs);
  await ctx.close();     // flushes the video
  await browser.close();
}

/** Films a title card. Same machinery as any other segment, so it inherits the
 *  trimming, manifest and mixing without special cases. */
async function cardSegment(c: Card) {
  await segment(c.name, c.secs, async (p) => {
    await p.setContent(cardHTML(c), { waitUntil: "domcontentloaded" });
    await wait(900);            // let the webfont land before the animation reads
  });
}

async function main() {
  if (existsSync("film/timing.json")) console.log("Sizing segments to film/timing.json");
  else console.log("No film/timing.json: using planned windows. Run npm run voice first.");

  mkdirSync(OUT, { recursive: true });
  for (const name of [...Object.keys(CUES), ...CARDS.map((c) => c.name)])
    rmSync(`${OUT}/${name}`, { recursive: true, force: true });

  /**
   * Drive scroll position directly. The page sets scroll-behavior on the html
   * element for its nav anchors; left on, every per-frame scrollTo starts a new
   * browser easing toward a target that has already moved, and the two fight.
   */
  const scrollTo = (y: number, dur = 2200) => `
    (async () => {
      const doc = document.documentElement;
      const prev = doc.style.scrollBehavior;
      doc.style.scrollBehavior = 'auto';
      const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
      const from = window.scrollY, to = ${y}, t0 = performance.now();
      await new Promise(done => {
        const step = now => {
          const k = Math.min(1, (now - t0) / ${dur});
          window.scrollTo(0, Math.round(from + (to - from) * ease(k)));
          k < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
      doc.style.scrollBehavior = prev;
    })()`;

  const at = (sel: string, offset = 140) => `
    (() => {
      const e = document.querySelector(${JSON.stringify(sel)});
      return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - ${offset}) : 0;
    })()`;

  // 1. The claim, on the public landing page.
  await segment("01-claim", windowFor("01-claim", 26), async (p) => {
    await p.goto(SITE, { waitUntil: "domcontentloaded" });
    await untilPainted(p, 900);
    await wait(1200);
    void p.evaluate(scrollTo(0, 1)).catch(() => {});
    await wait(17000);
    const y = (await p.evaluate(at("h2"))) as number;
    void p.evaluate(scrollTo(y, 3500)).catch(() => {});
  });

  // 2. The job, and the three things the agent was allowed to do.
  await segment("02-ledger", windowFor("02-ledger", 34), async (p) => {
    await p.goto(RECORD, { waitUntil: "domcontentloaded" });
    await untilPainted(p, 900);
    const y1 = (await p.evaluate(at("blockquote"))) as number;
    await p.evaluate(scrollTo(y1, 1));
    await wait(9000);
    const y2 = (await p.evaluate(at('[aria-label="Ledger of authority"] li:nth-child(1)'))) as number;
    void p.evaluate(scrollTo(y2, 2400)).catch(() => {});
    await wait(9000);
    // Offset deliberately large: it parks the corroboration card low in frame
    // so the refusal below it stays off screen. Segment 3 owns that reveal, and
    // showing it here spoils the only moment the film is built around.
    const y3 = (await p.evaluate(at('[aria-label="Ledger of authority"] li:nth-child(3)', 470))) as number;
    void p.evaluate(scrollTo(y3, 3000)).catch(() => {});
  });

  // 3. The refusal. Park on it and stay there; this is the moment.
  await segment("03-refusal", windowFor("03-refusal", 38), async (p) => {
    await p.goto(RECORD, { waitUntil: "domcontentloaded" });
    await untilPainted(p, 900);
    const y = (await p.evaluate(at(".border-seal\\/25", 120))) as number;
    await p.evaluate(scrollTo(y, 1));
    await wait(1500);
  });

  // 4. A person authorised it, and the limits.
  await segment("04-authorized", windowFor("04-authorized", 30), async (p) => {
    await p.goto(RECORD, { waitUntil: "domcontentloaded" });
    await untilPainted(p, 900);
    const y = (await p.evaluate(at("section:last-of-type"))) as number;
    await p.evaluate(scrollTo(y, 1));
    await wait(11000);
    void p.evaluate(scrollTo(0, 3200)).catch(() => {});
  });

  for (const c of CARDS) await cardSegment(c);
  writeFileSync(`${OUT}/setup.json`, JSON.stringify(setupTimes, null, 2));
  console.log(`\nSegments in ${OUT}/. Next: npm run film:cut`);
}

main().catch((e) => { console.error(e); process.exit(1); });
