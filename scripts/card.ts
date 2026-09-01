/**
 * Title cards.
 *
 * A card is filmed like any other segment, so it inherits the same trimming,
 * timing and mixing. It is a generated page rather than an ffmpeg overlay
 * because this ffmpeg has no drawtext, and because a card built in HTML
 * inherits the product's own typography instead of looking bolted on.
 *
 * Per project: edit THEME and the CARDS list.
 */
export type Card = {
  /** Segment name. Prefix with a number so it sorts into place. */
  name: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  secs: number;
};

export const THEME = {
  ground: "#08090b",
  ink: "#e8ebf0",
  dim: "#8b93a1",
  accent: "#4fd1c5",
  mono: '"Azeret Mono", ui-monospace, Menlo, monospace',
  sans: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
  fonts: "https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500&display=swap",
};

export function cardHTML(c: Card): string {
  const t = THEME;
  return `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${t.fonts}" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;background:${t.ground};overflow:hidden}
  body{display:grid;place-items:center;font-family:${t.sans};color:${t.ink}}
  .w{max-width:60ch;padding:0 60px;text-align:center}
  .k{font-family:${t.mono};font-size:11px;letter-spacing:.22em;text-transform:uppercase;
     color:${t.accent};opacity:0;animation:up .7s cubic-bezier(.2,.7,.2,1) .15s forwards}
  h1{font-family:${t.mono};font-weight:400;letter-spacing:-.045em;line-height:1.1;
     font-size:clamp(30px,4.6vw,54px);margin:16px 0 0;opacity:0;
     animation:up .85s cubic-bezier(.2,.7,.2,1) .32s forwards}
  p{font-size:17px;color:${t.dim};margin:20px 0 0;opacity:0;
    animation:up .8s cubic-bezier(.2,.7,.2,1) .58s forwards}
  .r{height:1px;background:${t.accent};margin:34px auto 0;width:0;opacity:.5;
     animation:grow 1.1s cubic-bezier(.2,.7,.2,1) .75s forwards}
  @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes grow{to{width:180px}}
  /* A faint field, so a card is not a flat colour next to a lit product. */
  body::before{content:"";position:fixed;inset:0;pointer-events:none;
    background:radial-gradient(120% 80% at 50% 45%,rgba(79,209,197,.055),transparent 60%)}
</style>
<div class="w">
  ${c.kicker ? `<div class="k">${c.kicker}</div>` : ""}
  <h1>${c.title}</h1>
  ${c.subtitle ? `<p>${c.subtitle}</p>` : ""}
  <div class="r"></div>
</div>`;
}

/** Per project. Empty list = no cards, pipeline behaves as before. */
export const CARDS: Card[] = [
  {
    name: "00-open",
    kicker: "DevNetwork API World 2026",
    title: "Recuse",
    subtitle: "An agent may draft and prove. It may never authorize.",
    secs: 5,
  },
];
