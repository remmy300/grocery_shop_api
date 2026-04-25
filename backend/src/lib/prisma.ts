import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Handle Prisma connection errors
prisma.$connect().catch((err) => {
  console.error("❌ Database connection failed:", err.message);
  console.error(
    "📍 Check DATABASE_URL in .env:",
    process.env.DATABASE_URL?.substring(0, 30) + "...",
  );
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
