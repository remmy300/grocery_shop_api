import prisma from "../lib/prisma.js";

export const findUserProfile = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

export const findUserOrders = async (userId: number) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findOrCreateCart = async (userId: number) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return cart;
};
