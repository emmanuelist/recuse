/**
 * The agreement body.
 *
 * Deliberately carries NO eSign text tags. Tags were tried first and never
 * parsed — `processTextTags: true` was accepted and ignored, and the literal
 * `${signfield:1:y:____}` string printed on the document a human was being
 * asked to sign. Foxit's own quick start places fields by coordinate and sets
 * `processTextTags: false`, which is what we do now.
 *
 * The signature block is pinned to a fixed offset from the bottom of the page
 * so the field coordinates in lib/foxit/client.ts stay correct regardless of
 * how long the body text runs.
 */
export function agreementHtml(a: {
  title: string;
  counterparty: string;
  feeUsd: number;
  startDate: string;
  endDate: string;
}): string {
  const fee = a.feeUsd.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:letter;margin:0}
    body{font:12pt/1.6 Georgia,serif;margin:0;padding:64px 72px;color:#111;
         width:612pt;height:792pt;box-sizing:border-box;position:relative}
    h1{font-size:16pt;letter-spacing:.06em;text-transform:uppercase;margin:0 0 28px}
    ol{padding-left:20px} li{margin-bottom:12px}
    /* Pinned so the signature field coordinates never drift with body length. */
    .sig{position:absolute;left:72pt;right:72pt;bottom:150pt}
    .sig .line{border-bottom:1px solid #666;height:44pt}
    .sig .cap{font-size:9pt;color:#555;margin-top:16pt}
  </style></head><body>
    <h1>${escapeHtml(a.title)}</h1>
    <p>This Agreement is entered into between <strong>${escapeHtml(a.counterparty)}</strong>
       and the Client.</p>
    <ol>
      <li><strong>Fee.</strong> The Client shall pay a fixed fee of ${fee}.</li>
      <li><strong>Term.</strong> This Agreement commences on ${escapeHtml(a.startDate)}
          and terminates on ${escapeHtml(a.endDate)}.</li>
      <li><strong>Notice.</strong> Either party may terminate on 30 days written notice.</li>
    </ol>
    <div class="sig">
      <div class="line"></div>
      <p class="cap">Authorised signatory &mdash; to be signed by a person</p>
    </div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
