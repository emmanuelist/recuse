/**
 * The agreement body. Authored here rather than in a .docx template so the
 * eSign text tags land exactly where they must.
 *
 * Tag syntax is `${fieldtype:party:required:name:width}` — underscores for
 * width, never spaces, straight ASCII only. `processTextTags: true` on the
 * eSign folder turns these into real signature fields.
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
    body{font:12pt/1.6 Georgia,serif;margin:56px;color:#111}
    h1{font-size:16pt;letter-spacing:.06em;text-transform:uppercase;margin:0 0 28px}
    ol{padding-left:20px} li{margin-bottom:12px}
    .sig{margin-top:56px;padding-top:20px;border-top:1px solid #999}
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
      <p>Authorised signatory: \${signfield:1:y:____________________}</p>
      <p>Date: \${datefield:1:y::____________}</p>
    </div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
