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
  const terms = claim.toLowerCase().match(/[a-z][a-z.&'-]{2,}/g) ?? [];
  const distinctive = terms.filter(
    (t) => !["the", "and", "for", "with", "that", "this", "from", "registered", "company"].includes(t),
  );
  const hits = distinctive.filter((t) => haystack.some((h: string) => h.includes(t)));
  const ratio = distinctive.length ? hits.length / distinctive.length : 0;

  return {
    claim,
    verdict: ratio >= 0.6 ? "corroborated" : "unverified",
    reason:
      ratio >= 0.6
        ? `Live results support this claim (${hits.length} of ${distinctive.length} key terms found in independent sources).`
        : `Live results do not support this claim (only ${hits.length} of ${distinctive.length} key terms appear). Treat it as unverified before signing.`,
    sources,
  };
}
