import "../config/env.js";
import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const require = createRequire(import.meta.url);
const pkg = require("@prisma/client") as any;
const PrismaClient = pkg?.PrismaClient ?? pkg?.default ?? pkg;

// Explicit pool with tight limits — prevents connection exhaustion on Render
// free tier (97 connection cap) and reconnects after idle timeouts.
// pg v8+ treats sslmode=require as verify-full, rejecting Render's cert.
// Strip sslmode from the URL so the explicit ssl config below takes effect.
const rawUrl = process.env.DATABASE_URL ?? "";
const connectionString = rawUrl.replace(/([?&])sslmode=[^&]*/g, "$1").replace(/[?&]$/, "");

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[db] idle client error:", err.message);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

prisma.$connect().catch((err: any) => {
  console.error("[db] connection failed:", err?.message ?? err);
  process.exit(1);
});

async function gracefulShutdown(signal: string) {
  console.log(`[db] ${signal} received — closing connections`);
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default prisma;
