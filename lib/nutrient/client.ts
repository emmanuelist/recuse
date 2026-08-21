/**
 * Nutrient DWS — Data Extraction API.
 *
 * Endpoint verified 2026-08-21. Note this is NOT the Processor API: `/build`
 * and `/tokens` belong to that product and return 403 with a Data Extraction
 * key, which is what made this look like an auth failure the first time.
 *
 * Free tier is 5,000 credits/month and extraction output is unwatermarked.
 */
const BASE = "https://api.nutrient.io";

export type ExtractedElement = {
  role: string;
  text: string;
  confidence?: number;
  page?: number;
};

export async function extractDocument(
  pdf: ArrayBuffer,
  filename = "agreement.pdf",
): Promise<{ elements: ExtractedElement[]; pages: number; ms: number; raw: unknown }> {
  const key = process.env.NUTRIENT_API_KEY;
  if (!key) throw new Error("NUTRIENT_API_KEY is not set.");

  const form = new FormData();
  form.append("file", new Blob([pdf], { type: "application/pdf" }), filename);
  form.append(
    "instructions",
    JSON.stringify({ mode: "understand", output: { format: "spatial" } }),
  );

  const res = await fetch(`${BASE}/extraction/parse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Nutrient responded ${res.status}: ${text.slice(0, 200)}`);

  const raw = JSON.parse(text) as {
    metrics?: { pagesProcessed?: number; processingTimeMs?: number };
    output?: { elements?: Array<Record<string, unknown>> };
  };

  const elements: ExtractedElement[] = (raw.output?.elements ?? [])
    .map((e) => ({
      role: String(e.role ?? "Text"),
      text: String(e.text ?? "").replace(/\s+/g, " ").trim(),
      confidence: typeof e.confidence === "number" ? e.confidence : undefined,
      page: (e.page as { pageNumber?: number } | undefined)?.pageNumber,
    }))
    .filter((e) => e.text.length > 0)
    .sort((a, b) => (a.page ?? 0) - (b.page ?? 0));

  return {
    elements,
    pages: raw.metrics?.pagesProcessed ?? 0,
    ms: raw.metrics?.processingTimeMs ?? 0,
    raw,
  };
}

/**
 * Pull the terms that actually matter for authorization out of what was read
 * back. Deliberately regex over the extracted text rather than asking a model:
 * the whole point of this stage is that the model does not get to vouch for its
 * own output.
 */
export function readTerms(elements: ExtractedElement[]): {
  counterparty?: string;
  feeUsd?: number;
  startDate?: string;
  endDate?: string;
  noticeDays?: number;
} {
  const all = elements.map((e) => e.text).join(" ");
  const fee = /(?:USD|\$)\s?([\d,]+(?:\.\d{2})?)/i.exec(all);
  const counterparty = /between\s+([A-Z][\w.&' -]+?(?:Ltd|LLC|Inc|GmbH|Limited|Corp)\b)/.exec(all);
  const dates = [...all.matchAll(/\b(\d{1,2}\s+[A-Z][a-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})\b/g)].map(
    (m) => m[1],
  );
  const notice = /(\d+)\s+days?\s+(?:written\s+)?notice/i.exec(all);

  return {
    counterparty: counterparty?.[1]?.trim(),
    feeUsd: fee ? Number(fee[1].replace(/,/g, "")) : undefined,
    startDate: dates[0],
    endDate: dates[1],
    noticeDays: notice ? Number(notice[1]) : undefined,
  };
}
