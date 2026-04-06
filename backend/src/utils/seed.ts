import "dotenv/config";
import prisma from "../lib/prisma";

const ADMIN_EMAIL = "jenta@admin.com";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "admin",
      password: "",
    },
    create: {
      email: ADMIN_EMAIL,
      password: "",
      role: "admin",
    },
  });

  console.log(`Admin user ensured: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
