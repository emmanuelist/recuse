import { generateDocument, createSignatureFolder, downloadUrl } from "@/lib/foxit/client";
import { agreementHtml } from "@/lib/agreement";

/**
 * The agent's tool surface.
 *
 * `sign_document` deliberately EXISTS. It would be easier to simply omit it —
 * an agent cannot call a tool it was never given. That would also be a weaker
 * product: the boundary would be invisible, and a judge would have nothing to
 * look at but an absence.
 *
 * So the capability is offered and then refused at the point of execution. The
 * model can reach for it, and the reaching is recorded. What it cannot do is
 * complete it, because this file contains no code that signs anything.
 *
 * See AGENTS.md section 2. This is the one rule with no exceptions.
 */

export type ToolDeclaration = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolOutcome = {
  result: string;
  /** True only when the boundary refused the call — not a failure. */
  refused?: boolean;
  /** Structured detail persisted to agent_events.payload. */
  detail?: Record<string, unknown>;
};

const str = (description: string) => ({ type: "string", description });

const allDeclarations: ToolDeclaration[] = [
  {
    type: "function",
    name: "draft_document",
    description:
      "Generate a real document from structured data. Produces an actual file, " +
      "not a description of one. Use this before any other step.",
    parameters: {
      type: "object",
      properties: {
        title: str("Short title for the document, e.g. 'Services Agreement'"),
        counterparty: str("Legal name of the other party"),
        feeUsd: { type: "number", description: "Total fee in US dollars" },
        startDate: str("ISO date the agreement begins"),
        endDate: str("ISO date the agreement ends"),
      },
      required: ["title", "counterparty", "feeUsd", "startDate", "endDate"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "establish_terms",
    description:
      "Read back what the generated document actually says, deterministically. " +
      "Use this to check the document matches what you intended. Your own " +
      "recollection of what you drafted is not evidence.",
    parameters: {
      type: "object",
      properties: { documentId: str("Document id returned by draft_document") },
      required: ["documentId"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "corroborate_claim",
    description:
      "Check a factual claim the document makes about the world against live " +
      "web data — company registration, address, entity status. Returns " +
      "corroborated, contradicted or unverified.",
    parameters: {
      type: "object",
      properties: { claim: str("A single checkable factual claim") },
      required: ["claim"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "sign_document",
    description:
      "Apply a binding signature to the document on behalf of the account holder.",
    parameters: {
      type: "object",
      properties: { documentId: str("Document id to sign") },
      required: ["documentId"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "request_authorization",
    description:
      "Route the document to a named human for signature. This is how a " +
      "document becomes binding. Returns immediately; the human signs in their " +
      "own time and you will not observe it.",
    parameters: {
      type: "object",
      properties: {
        documentId: str("Document id to route"),
        signerEmail: str("Email address of the human authorizer"),
        signerFirstName: str("Signer's first name"),
        signerLastName: str("Signer's last name"),
      },
      required: ["documentId", "signerEmail", "signerFirstName", "signerLastName"],
      additionalProperties: false,
    },
  },
];

/**
 * Only tools with a working implementation are offered to the model. A declared
 * tool that returns "unknown tool" is an integration claimed but not built, and
 * it teaches the model to plan around a capability that is not there.
 * `establish_terms` lands in M3, `corroborate_claim` in M4.
 */
const IMPLEMENTED = new Set([
  "draft_document",
  "sign_document",
  "request_authorization",
]);

export const declarations: ToolDeclaration[] =
  allDeclarations.filter((d) => IMPLEMENTED.has(d.name));

/**
 * The refusal. Called when the model reaches for `sign_document`.
 *
 * There is no argument, state, environment variable or flag that makes this
 * return anything else. Removing the refusal does not enable signing — it
 * removes the only implementation this tool has.
 */
function refuseToSign(args: { documentId: string }): ToolOutcome {
  return {
    refused: true,
    result:
      "Refused. You have no authority to sign. Signing commits the account " +
      "holder to a binding obligation, and that authority was never delegated " +
      "to you. Route the document to a human with request_authorization; a " +
      "person signs it, or it does not get signed.",
    detail: { attemptedOn: args.documentId, boundary: "authorization" },
  };
}

export type ToolContext = {
  runId: string;
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolOutcome> {
  switch (name) {
    case "sign_document":
      return refuseToSign(args as { documentId: string });

    case "draft_document": {
      const a = args as {
        title: string; counterparty: string; feeUsd: number;
        startDate: string; endDate: string;
      };
      const out = await generateDocument({
        html: agreementHtml(a),
        outputName: a.title.replace(/\s+/g, "-").toLowerCase(),
      });
      return {
        result: `Document generated: ${a.title} with ${a.counterparty}, ` +
                `USD ${a.feeUsd}, ${a.startDate} to ${a.endDate}. ` +
                `Document id ${out.documentId}.`,
        detail: { taskId: out.taskId, documentId: out.documentId },
      };
    }

    case "request_authorization": {
      const a = args as {
        documentId: string; signerEmail: string;
        signerFirstName: string; signerLastName: string;
      };
      const folder = await createSignatureFolder({
        folderName: `Recuse ${ctx.runId.slice(0, 8)}`,
        fileUrls: [downloadUrl(a.documentId)],
        fileNames: ["agreement.pdf"],
        signer: {
          firstName: a.signerFirstName,
          lastName: a.signerLastName,
          email: a.signerEmail,
        },
        // Live sends are gated: development and rehearsal must not email anyone.
        sendNow: process.env.RECUSE_SEND_FOR_REAL === "true",
      });
      return {
        result:
          `Routed to ${a.signerEmail} for authorization. Status: ` +
          `${folder.folderStatus ?? "created"}. You will not be told when they ` +
          `sign; the signature arrives independently of you.`,
        detail: { folderId: folder.folderId, folderStatus: folder.folderStatus },
      };
    }

    default:
      // Unreachable while `declarations` is filtered by IMPLEMENTED.
      return { result: `Tool ${name} is not implemented in this milestone.` };
  }
}
