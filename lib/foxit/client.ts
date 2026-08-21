/**
 * Foxit fusion host. PDF Services, Document Generation and eSign all live here
 * and share one credential pair — verified 2026-08-20. See AGENTS.md.
 *
 * The free Developer plan allows 500 credits PER YEAR across all three. Every
 * call in this file is billable unless noted. Read AGENTS.md section 4 before
 * adding another one.
 */
const HOST = "https://na1.fusion.foxit.com";

function credentials(): Record<string, string> {
  const id = process.env.FOXIT_CLIENT_ID;
  const secret = process.env.FOXIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("FOXIT_CLIENT_ID / FOXIT_CLIENT_SECRET are not set.");
  }
  return { client_id: id, client_secret: secret };
}

/**
 * The fusion host sits behind Cloudflare and returns intermittent 502s on
 * requests that succeed when retried unchanged — observed 2026-08-21, where an
 * identical upload failed and then succeeded seconds later. A transient 502
 * during the live demo would be indistinguishable from a broken product, so
 * every call goes through here.
 *
 * Only 5xx and network faults are retried. A 4xx is our mistake and repeating
 * it just wastes time.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = 4,
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status < 500) return res;
      lastError = new FoxitError(res.status, (await res.text()).slice(0, 200));
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** i + Math.random() * 200));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Foxit request failed after ${attempts} attempts`);
}

export class FoxitError extends Error {
  constructor(readonly status: number, readonly body: string) {
    super(`Foxit responded ${status}: ${body.slice(0, 300)}`);
    this.name = "FoxitError";
  }
}

/**
 * Costs no credits: a task-status lookup authenticates without doing billable
 * work. This is the only safe way to check credentials.
 */
export async function verifyCredentials(): Promise<boolean> {
  const res = await fetch(
    `${HOST}/pdf-services/api/tasks/00000000-0000-0000-0000-000000000000`,
    { headers: credentials() },
  );
  return res.status !== 401;
}

/**
 * Document pipeline, verified against the live API on 2026-08-21:
 *   upload (multipart)  ->  documentId
 *   create/pdf-from-html ->  taskId
 *   tasks/{id}           ->  poll until COMPLETED  ->  result documentId
 *
 * The path shown in the dashboard sample (`/document-generation/api/generate`)
 * returns 404 for this account. Probed alternatives are recorded in
 * evidence/api/foxit-endpoint-probe.txt — do not re-guess them.
 *
 * We author the agreement HTML ourselves rather than uploading a .docx
 * template, because the eSign text tags (${signfield:1:y:____}) have to land in
 * exact positions and we need to control them precisely.
 */
export async function uploadDocument(
  content: string | Uint8Array,
  filename: string,
  contentType: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([content as BlobPart], { type: contentType }), filename);
  const res = await fetchWithRetry(`${HOST}/pdf-services/api/documents/upload`, {
    method: "POST",
    headers: credentials(),
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new FoxitError(res.status, text);
  const raw = JSON.parse(text);
  const id = raw.documentId ?? raw.id;
  if (!id) throw new FoxitError(res.status, `no documentId in response: ${text.slice(0, 200)}`);
  return id;
}

async function pollTask(taskId: string, timeoutMs = 60_000): Promise<Record<string, unknown>> {
  const deadline = Date.now() + timeoutMs;
  let delay = 700;
  while (Date.now() < deadline) {
    const res = await fetchWithRetry(`${HOST}/pdf-services/api/tasks/${taskId}`, { headers: credentials() });
    const body = (await res.json()) as Record<string, unknown>;
    const status = String(body.status ?? "").toUpperCase();
    if (status === "COMPLETED") return body;
    if (status === "FAILED") throw new FoxitError(200, JSON.stringify(body));
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 4000);
  }
  throw new Error(`Foxit task ${taskId} did not complete within ${timeoutMs}ms`);
}

/** Billable. Turns agreement HTML into a real PDF and returns its document id. */
export async function generateDocument(input: {
  html: string;
  outputName: string;
}): Promise<{ documentId: string; taskId: string; raw: unknown }> {
  const sourceId = await uploadDocument(input.html, `${input.outputName}.html`, "text/html");

  const res = await fetchWithRetry(`${HOST}/pdf-services/api/documents/create/pdf-from-html`, {
    method: "POST",
    headers: { ...credentials(), "Content-Type": "application/json" },
    body: JSON.stringify({ documentId: sourceId }),
  });
  const text = await res.text();
  if (!res.ok) throw new FoxitError(res.status, text);
  const started = JSON.parse(text) as { taskId: string };

  const done = await pollTask(started.taskId);
  const documentId = String(
    (done.resultDocumentId as string) ??
      ((done.result as Record<string, unknown>)?.documentId as string) ??
      "",
  );
  if (!documentId) throw new Error(`no result document id in task: ${JSON.stringify(done).slice(0, 200)}`);
  return { documentId, taskId: started.taskId, raw: done };
}

/** Download URL an eSign folder can fetch the generated PDF from. */
export function downloadUrl(documentId: string): string {
  return `${HOST}/pdf-services/api/documents/${documentId}/download`;
}

/**
 * Billable. Creates an eSign "folder" — what other platforms call an envelope.
 *
 * `sendNow` decides whether a human is actually emailed. Development and
 * rehearsal use `sendNow: false`, which produces a DRAFT and contacts nobody.
 * Only the demo and integration checkpoints should pass `true`.
 */
export async function createSignatureFolder(input: {
  folderName: string;
  fileUrls: string[];
  fileNames: string[];
  signer: { firstName: string; lastName: string; email: string };
  sendNow: boolean;
}): Promise<{ folderId?: string; folderStatus?: string; raw: unknown }> {
  const res = await fetchWithRetry(`${HOST}/esign/api/v1/folders/createfolder`, {
    method: "POST",
    headers: { ...credentials(), "Content-Type": "application/json" },
    body: JSON.stringify({
      folderName: input.folderName,
      inputType: "url",
      fileUrls: input.fileUrls,
      fileNames: input.fileNames,
      parties: [
        {
          firstName: input.signer.firstName,
          lastName: input.signer.lastName,
          emailId: input.signer.email,
          permission: "FILL_FIELDS_AND_SIGN",
          sequence: 1,
        },
      ],
      processTextTags: true,
      sendNow: input.sendNow,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new FoxitError(res.status, text);
  const raw = JSON.parse(text);
  return { folderId: raw?.folder?.folderId, folderStatus: raw?.folder?.folderStatus, raw };
}
