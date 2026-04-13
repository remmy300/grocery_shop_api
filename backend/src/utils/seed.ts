import "dotenv/config";
import prisma from "../lib/prisma.js";

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

  // Add sample products
  const products = [
    {
      name: "Organic Apples",
      price: 299,
      stock: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    },
    {
      name: "Fresh Bananas",
      price: 199,
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400",
    },
    {
      name: "Whole Milk",
      price: 399,
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    },
    {
      name: "Bread Loaf",
      price: 249,
      stock: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    },
    {
      name: "Chicken Breast",
      price: 899,
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400",
    },
    {
      name: "Rice 5kg",
      price: 1299,
      stock: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log(`Sample products added`);

  // Add sample orders
  const customers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown"];
  const addresses = ["123 Main St", "456 Oak Ave", "789 Pine Rd", "321 Elm St"];

  for (let i = 0; i < 10; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    const orderItems = [];

    // Create 1-3 random items per order
    const numItems = Math.floor(Math.random() * 3) + 1;
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = product.price * quantity;
      total += price;

      orderItems.push({
        productId: (await prisma.product.findFirst({
          where: { name: product.name },
        }))!.id,
        price: price / 100, // Convert to decimal
        quantity,
      });
    }

    const order = await prisma.order.create({
      data: {
        customer,
        phone: `555-0${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        address,
        total: total / 100, // Convert to decimal
        orderStatus: ["pending", "processing", "completed"][
          Math.floor(Math.random() * 3)
        ],
        items: {
          create: orderItems,
        },
      },
    });

    console.log(`Order ${order.id} created for ${customer}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
