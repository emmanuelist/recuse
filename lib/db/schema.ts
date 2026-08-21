import {
  pgTable, uuid, text, timestamp, integer, jsonb, index,
} from "drizzle-orm/pg-core";

/**
 * A single pass of the pipeline: draft -> establish -> corroborate -> authorize.
 * `status` never reaches "authorized" through agent action alone. Only an
 * inbound signature webhook moves it there. See AGENTS.md section 2.
 */
export const runs = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  brief: text("brief").notNull(),
  status: text("status").notNull().default("drafting"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  foxitTaskId: text("foxit_task_id"),
  storageUrl: text("storage_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("documents_run_idx").on(t.runId)]);

/**
 * The agent transcript. `kind: "refusal"` is a first-class event, not an error:
 * it is the product's central claim and the demo's turning point.
 */
export const agentEvents = pgTable("agent_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  seq: integer("seq").notNull(),
  kind: text("kind").notNull(),
  toolName: text("tool_name"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("agent_events_run_seq_idx").on(t.runId, t.seq)]);

/** What Nutrient read back out of the generated document. */
export const extractions = pgTable("extractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  extracted: jsonb("extracted").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A claim the document makes, checked against live web data before signing. */
export const corroborations = pgTable("corroborations", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  claim: text("claim").notNull(),
  verdict: text("verdict").notNull(), // corroborated | contradicted | unverified
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("corroborations_run_idx").on(t.runId)]);

/**
 * The human authorization. Written when the agent routes an envelope, and only
 * ever moved to "signed" by a verified inbound webhook — never by the agent.
 */
export const authorizations = pgTable("authorizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  envelopeId: text("envelope_id"),
  signerEmail: text("signer_email").notNull(),
  status: text("status").notNull().default("pending"), // pending | signed | declined | expired
  sentAt: timestamp("sent_at", { withTimezone: true }),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  webhookPayload: jsonb("webhook_payload"),
}, (t) => [index("authorizations_run_idx").on(t.runId)]);
