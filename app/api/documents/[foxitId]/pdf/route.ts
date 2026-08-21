import { fetchDocumentPdf } from "@/lib/foxit/client";

export const runtime = "nodejs";

/**
 * Public read-through for a generated document.
 *
 * eSign fetches the file itself, and it cannot authenticate to Foxit's own
 * `/pdf-services/api/documents/{id}/download`, which needs our client_id and
 * client_secret. Passing that URL to createfolder makes folder creation fail
 * with a 200 and an empty body — which is how this was missed the first time.
 *
 * So we serve the bytes from a URL eSign can actually reach. Ids are Foxit's
 * own opaque handles and are not enumerable, but this is deliberately public
 * read access to generated documents — see ISSUE-023.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ foxitId: string }> },
) {
  const { foxitId } = await params;
  if (!/^[a-f0-9]{16,}$/i.test(foxitId)) {
    return new Response("not found", { status: 404 });
  }
  try {
    const pdf = await fetchDocumentPdf(foxitId);
    return new Response(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="agreement-${foxitId.slice(0, 8)}.pdf"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
