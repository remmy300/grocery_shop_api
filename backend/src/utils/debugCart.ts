import prisma from "../lib/prisma.js";

async function run() {
  try {
    const cart = await prisma.cart.findFirst({
      include: {
        items: { include: { product: true } },
      },
    });
    console.log("DEBUG CART:", JSON.stringify(cart, null, 2));
  } catch (err) {
    console.error("DEBUG CART ERROR:", err);
    if (err instanceof Error) console.error(err.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
