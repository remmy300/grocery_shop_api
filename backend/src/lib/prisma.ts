import "../config/env.js";
import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";

// Use createRequire to safely import the generated Prisma client regardless
// of subtle ESM/CJS export shape differences across Prisma minor versions.
const require = createRequire(import.meta.url);
const pkg = require("@prisma/client") as any;
const PrismaClient = pkg?.PrismaClient ?? pkg?.default ?? pkg;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

prisma.$connect().catch((err: any) => {
  console.error(" Database connection failed:", err?.message ?? err);
  console.error(
    " Check DATABASE_URL in .env:",
    (process.env.DATABASE_URL || "").substring(0, 80) + "...",
  );

  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
