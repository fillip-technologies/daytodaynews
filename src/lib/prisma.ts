import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma";
import type * as mariadb from "mariadb";

// Reuse a single PrismaClient across hot reloads in development so we don't
// exhaust database connections. In production a module is evaluated once, so
// a new client is created per server instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseConnectionConfig(connectionString: string): mariadb.PoolConfig | string {
  try {
    const url = new URL(connectionString);
    const hasSsl =
      url.searchParams.has("ssl") ||
      url.searchParams.has("sslmode") ||
      url.searchParams.has("sslaccept") ||
      url.searchParams.has("ssl-mode");

    if (hasSsl) {
      return {
        host: url.hostname,
        port: url.port ? parseInt(url.port, 10) : 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        ssl: { rejectUnauthorized: false },
        connectTimeout: 20000,
      };
    }
  } catch {
    // fallback to raw connection string
  }
  return connectionString;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  // PrismaMariaDb takes connection string directly or connection pool config
  const poolConfig = parseConnectionConfig(connectionString);
  const adapter = new PrismaMariaDb(poolConfig as any);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma && "siteSetting" in globalForPrisma.prisma
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
