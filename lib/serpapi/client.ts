/**
 * SerpApi — live web data, used here for one purpose only: checking claims the
 * document makes about the world before a person is asked to commit to them.
 *
 * Free tier is 250 searches/month at 50/hour. Not a general search tool for the
 * agent; if it ever becomes one, cut it (see AGENTS.md and ISSUE-011).
 */
export type Corroboration = {
  claim: string;
  verdict: "corroborated" | "contradicted" | "unverified";
  reason: string;
  sources: Array<{ title: string; link: string; snippet: string }>;
};

export async function corroborate(claim: string): Promise<Corroboration> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error("SERPAPI_API_KEY is not set.");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("q", claim);
  url.searchParams.set("engine", "google");
  url.searchParams.set("num", "5");
  url.searchParams.set("api_key", key);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`SerpApi responded ${res.status}`);
  const data = (await res.json()) as {
    organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
    error?: string;
  };
  if (data.error) throw new Error(`SerpApi: ${data.error}`);

  const sources = (data.organic_results ?? []).slice(0, 4).map((r) => ({
    title: String(r.title ?? ""),
    link: String(r.link ?? ""),
    snippet: String(r.snippet ?? ""),
  }));

  // Report what the evidence shows; never assert a match that is not there.
  if (sources.length === 0) {
    return {
      claim,
      verdict: "unverified",
      reason: "Live search returned nothing about this claim. It is unsupported, which is not the same as false.",
      sources,
    };
  }

  const haystack = sources.map((s) => `${s.title} ${s.snippet}`.toLowerCase());

  // Every distinctive term must appear. The earlier rule accepted a 60% overlap
  // and produced a false CORROBORATED on "Northwind Trading Ltd, registered in
  // Delaware": it matched the company name against UK Companies House and
  // ignored "delaware", which was the entire substance of the claim.
  //
  // A verification stage that manufactures confidence is worse than none, so
  // the failure direction is deliberate — this reports "unverified" readily and
  // "corroborated" only when nothing in the claim is left unsupported.
  const STOP = new Set([
    "the", "and", "for", "with", "that", "this", "from", "registered",
    "company", "limited", "ltd", "llc", "inc", "corp", "incorporated",
    "is", "are", "was", "were", "has", "have", "a", "an", "in", "of", "at",
  ]);
  const terms = (claim.toLowerCase().match(/[a-z][a-z.&'-]{2,}/g) ?? [])
    .filter((t) => !STOP.has(t));
  const distinctive = [...new Set(terms)];

  const missing = distinctive.filter((t) => !haystack.some((h: string) => h.includes(t)));
  const found = distinctive.filter((t) => !missing.includes(t));

  if (missing.length > 0) {
    return {
      claim,
      verdict: "unverified",
      reason:
        `Live results support ${found.length} of ${distinctive.length} terms in this claim, ` +
        `but nothing found mentions ${missing.map((m) => `"${m}"`).join(", ")}. ` +
        `The unsupported part may be the part that matters, so this is not corroborated.`,
      sources,
    };
  }

  return {
    claim,
    verdict: "corroborated",
    reason:
      `Every distinctive term in this claim (${distinctive.join(", ")}) appears in ` +
      `independent live sources.`,
    sources,
  };
}
