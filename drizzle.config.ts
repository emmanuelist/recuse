import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  // Direct endpoint, not the pooler: DDL must not run through PgBouncer.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
});
