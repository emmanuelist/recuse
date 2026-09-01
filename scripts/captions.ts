/**
 * Captions, derived FROM the narration rather than written alongside it.
 *
 * One script, two renderings: the same sentences are spoken and shown. Written
 * separately they drift, and a caption contradicting the voice is worse than no
 * caption at all.
 *
 * Rendered inside the page during filming rather than burned on afterwards:
 * this ffmpeg ships without libass/libfreetype, and doing it in the page is
 * better anyway, because captions inherit the product's own typography.
 * Judges watch muted, so these carry the argument on their own.
 */
import { NARRATION } from "./narration.js";
import { readFileSync } from "node:fs";

export type Cue = { at: number; secs: number; text: string; kind?: "beat" | "note" };

const WPS = 2.6;            // calm delivery
const LEAD = 0.35;          // captions land a beat before the voice

/** Sentences, kept whole. A caption split mid-clause is unreadable at speed. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    // Merge very short fragments into the previous line so nothing flashes.
    .reduce<string[]>((acc, s) => {
      const words = s.split(/\s+/).length;
      if (words <= 4 && acc.length) acc[acc.length - 1] += " " + s;
      else acc.push(s);
      return acc;
    }, []);
}

/** Time is allocated by word count, which is how long it takes to say it. */
function cuesFor(text: string, window: number): Cue[] {
  const parts = sentences(text);
  const total = parts.reduce((a, s) => a + s.split(/\s+/).length, 0);
  let t = LEAD;
  return parts.map((s, i) => {
    const share = s.split(/\s+/).length / total;
    const secs = Math.max(2.2, share * (window - LEAD));
    const cue: Cue = { at: +t.toFixed(2), secs: +secs.toFixed(2), text: s };
    // The closing sentence of each segment is the beat worth emphasising.
    if (i === parts.length - 1) cue.kind = "beat";
    t += secs;
    return cue;
  });
}

/** Prefer measured sentence timings from the generated audio. Estimating from
 *  words per second drifts within a segment, and a caption that no longer
 *  matches the voice is worse than no caption. */
function load(): Record<string, Cue[]> {
  try {
    const raw = readFileSync(new URL("../film/timing.json", import.meta.url).pathname, "utf8");
    const t = JSON.parse(raw) as Record<string, { text: string; at: number; secs: number }[]>;
    const out: Record<string, Cue[]> = {};
    for (const [seg, lines] of Object.entries(t)) {
      out[seg] = lines.map((l, i) => ({
        at: Math.max(0, l.at - LEAD),
        secs: l.secs + LEAD,
        text: l.text,
        ...(i === lines.length - 1 ? { kind: "beat" as const } : {}),
      }));
    }
    return out;
  } catch {
    return Object.fromEntries(NARRATION.map((b) => [b.segment, cuesFor(b.text, b.secs)]));
  }
}

export const CUES: Record<string, Cue[]> = load();

export const CAPTION_RUNTIME = `
(cues => {
  const wrap = document.createElement('div');
  wrap.id = '__cap';
  wrap.innerHTML = '<div class="__cap-in"><span class="__cap-t"></span></div>';
  const css = document.createElement('style');
  css.textContent = \`
    /* The activity log runs down the LEFT of the main column and is the thing
       the demo points at, so captions sit clear of it, not over it. */
    #__cap{position:fixed;left:0;right:0;bottom:0;z-index:99999;pointer-events:none;
      display:flex;justify-content:center;padding:0 0 34px;
      font-family:"Azeret Mono",ui-monospace,Menlo,monospace;}
    @media (max-width:1200px){#__cap{padding-bottom:46px;}}
    /* Recuse centres its content in a ~900px column, so a floating caption
       box lands directly on the text it is describing. A full-width bar with
       a scrim reads as a subtitle track instead of a collision. */
    #__cap::before{content:'';position:absolute;left:0;right:0;bottom:0;height:190px;
      background:linear-gradient(to top,rgba(6,7,9,.97) 0%,rgba(6,7,9,.90) 42%,rgba(6,7,9,0) 100%);}
    #__cap .__cap-in{
      max-width:56ch;margin:0 auto;padding:14px 22px 26px;text-align:center;position:relative;
      background:rgba(6,7,9,.90);border:1px solid rgba(79,209,197,.30);
      border-radius:2px;backdrop-filter:blur(10px);
      box-shadow:0 18px 60px rgba(0,0,0,.6);
      opacity:0;transform:translateY(9px);
      transition:opacity .40s cubic-bezier(.2,.7,.2,1),transform .40s cubic-bezier(.2,.7,.2,1);}
    #__cap.on .__cap-in{opacity:1;transform:none;}
    #__cap .__cap-t{font-size:17px;line-height:1.52;letter-spacing:-.02em;color:#e8ebf0;}
    #__cap.beat .__cap-in{border-color:rgba(79,209,197,.62);
      box-shadow:0 0 0 1px rgba(79,209,197,.12),0 18px 70px rgba(0,0,0,.65);}
    #__cap.beat .__cap-t{color:#4fd1c5;}
  \`;
  document.head.appendChild(css);
  // Outside body: body carries the zoom transform, and a transformed ancestor
  // becomes the containing block for position:fixed descendants.
  document.documentElement.appendChild(wrap);
  const el = wrap.querySelector('.__cap-t');
  // Sentences run back to back, so the caption SWAPS text and stays up. An
  // independent hide timer per cue meant the previous cue's hide fired after
  // the next cue had already shown, and every caption flashed off immediately.
  cues.forEach((c, i) => {
    setTimeout(() => {
      const swap = () => {
        el.textContent = c.text;
        wrap.classList.toggle('beat', c.kind === 'beat');
        wrap.classList.add('on');
      };
      if (i === 0) return swap();
      // Brief dip between lines so the change reads as a change.
      wrap.classList.remove('on');
      setTimeout(swap, 170);
    }, c.at * 1000);
  });
  const last = cues[cues.length - 1];
  setTimeout(() => wrap.classList.remove('on'), (last.at + last.secs + 0.4) * 1000);
})(__CUES__);
`;
