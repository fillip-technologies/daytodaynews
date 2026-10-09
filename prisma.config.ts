// Prisma CLI configuration (Prisma 7+). Used by `prisma generate`, `migrate`,
// `db pull`, `studio`, etc. The Prisma CLI does not load .env on its own, so
// dotenv is imported here.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI commands (migrations, introspection) should use a direct,
    // non-pooled connection. Falls back to DATABASE_URL when DIRECT_URL
    // is not set.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
