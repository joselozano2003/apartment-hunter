// This file is used by the Prisma CLI for migrations and introspection.
// The app uses lib/prisma.ts with the PG adapter for runtime connections.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For CLI operations (migrate, introspect), use the direct (non-pooling) URL
    url: process.env["POSTGRES_URL_NON_POOLING"],
  },
});
