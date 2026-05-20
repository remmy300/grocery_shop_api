import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { getAdminSettings, updateAdminSettings } from "../lib/adminSettings.js";

type ProductType = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
type UserType = Awaited<ReturnType<typeof prisma.user.findMany>>[number];
type OrderWithItems = Awaited<
  ReturnType<typeof prisma.order.findMany>
>[number] & {
  items: Array<{
    quantity: number;
    price: unknown;
    product: ProductType;
  }>;
};

const getDashboardOrders = async (): Promise<OrderWithItems[]> =>
  prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

const getDashboardProducts = async (): Promise<ProductType[]> =>
  prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { id: "asc" },
  });

const getDashboardUsers = async (): Promise<UserType[]> =>
  prisma.user.findMany({ orderBy: { id: "asc" } });

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeRole = (role?: string | null) => (role ?? "user").toLowerCase();

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const inferCategory = (name: string) => {
  const label = name.toLowerCase();

  if (/(milk|cheese|yogurt|cream|butter|dairy)/.test(label)) return "Dairy";
  if (/(bread|cake|pastry|dough|bakery)/.test(label)) return "Bakery & Deli";
  if (/(beef|chicken|fish|pork|meat)/.test(label)) return "Organic Meat";
  if (
    /(apple|banana|orange|pear|fruit|berry|grape|avocado|carrot|tomato|lettuce|produce|vegetable|veg)/.test(
      label,
    )
  )
    return "Produce";

  return "General Grocery";
};

const getInitials = (email: string) =>
  email
    .split("@")[0]
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const getDisplayName = (email: string) =>
  titleCase(email.split("@")[0].replace(/[._-]+/g, " "));

const formatOrderDate = (createdAt: Date) =>
  fullDateFormatter.format(createdAt);

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (year: number, monthIndex: number) =>
  monthFormatter.format(new Date(year, monthIndex, 1));

const getRecentMonths = (count: number) => {
  const months: Array<{
    key: string;
    year: number;
    monthIndex: number;
    label: string;
  }> = [];
  const now = new Date();

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: monthKey(date),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      label: getMonthLabel(date.getFullYear(), date.getMonth()).toUpperCase(),
    });
  }

  return months;
};

export const getDashboardOverview = async (_req: Request, res: Response) => {
  try {
    const [products, orders, users] = await Promise.all([
      getDashboardProducts(),
      getDashboardOrders(),
      getDashboardUsers(),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + toNumber(order.total),
      0,
    );
    const totalProducts = products.length;
    const lowStockItems = products.filter(
      (product) => product.stock <= 10,
    ).length;
    const activeAdmins = users.filter(
      (user) => normalizeRole(user.role) === "admin",
    ).length;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const ordersToday = orders.filter(
      (order) => new Date(order.createdAt) >= startOfToday,
    ).length;

    const uniqueCustomers = new Set(
      orders.map((order) => order.customer.trim().toLowerCase()),
    );

    const revenueByMonth = new Map<string, number>();
    const recentMonths = getRecentMonths(12);
    recentMonths.forEach((month) => revenueByMonth.set(month.key, 0));

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const key = monthKey(createdAt);
      revenueByMonth.set(
        key,
        (revenueByMonth.get(key) ?? 0) + toNumber(order.total),
      );
    });

    const revenueData = recentMonths.map((month) => ({
      month: month.label,
      revenue: revenueByMonth.get(month.key) ?? 0,
    }));

    const recentActivity = orders.slice(0, 5).map((order, index) => ({
      id: order.id,
      user: order.customer,
      action: "placed an order",
      item: `Order #${order.id}`,
      time: index === 0 ? "just now" : `${index * 3} mins ago`,
      initials: getInitials(order.customer),
    }));

    res.json({
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts,
        lowStockItems,
        activeAdmins,
        activeCustomers: uniqueCustomers.size,
        ordersToday,
      },
      recentActivity,
      revenueData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getInventoryOverview = async (_req: Request, res: Response) => {
  try {
    const products = await getDashboardProducts();

    const mappedProducts = products.map((product) => ({
      id: product.id,
      sku: `#ARC-${String(product.id).padStart(4, "0")}`,
      name: product.name,
      category: product.category || inferCategory(product.name),
      stock: product.stock,
      stockStatus:
        product.stock <= 0
          ? "Out of Stock"
          : product.stock <= 10
            ? "Low Stock"
            : "In Stock",
      price: toNumber(product.price),
      imageUrl: product.imageUrl,
    }));

    const totalProducts = mappedProducts.length;
    const lowStockItems = mappedProducts.filter(
      (product) => product.stockStatus === "Low Stock",
    ).length;
    const inventoryValue = mappedProducts.reduce(
      (sum, product) => sum + product.stock * product.price,
      0,
    );

    res.json({
      stats: {
        totalProducts,
        lowStockItems,
        inventoryValue,
      },
      products: mappedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch inventory data" });
  }
};

export const getOrdersOverview = async (_req: Request, res: Response) => {
  try {
    const orders = (await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })) as OrderWithItems[];

    const mappedOrders = orders.map((order) => {
      const orderStatus = titleCase(order.orderStatus || "pending");
      return {
        id: `#ARC-${String(order.id).padStart(4, "0")}`,
        orderId: order.id,
        customer: order.customer,
        date: formatOrderDate(new Date(order.createdAt)),
        total: toNumber(order.total),
        orderStatus,
        itemCount: order.items.length,
        initials: getInitials(order.customer),
        statusColor:
          order.orderStatus === "delivered"
            ? "bg-surface-container-highest text-on-surface-variant"
            : order.orderStatus === "shipped"
              ? "bg-primary-fixed text-on-primary-fixed-variant"
              : "bg-secondary-fixed text-on-secondary-fixed-variant",
        items: order.items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: toNumber(item.price),
        })),
      };
    });

    const stats = {
      totalOrders: mappedOrders.length,
      pendingOrders: orders.filter((order) => order.orderStatus === "pending")
        .length,
      shippedOrders: orders.filter((order) => order.orderStatus === "shipped")
        .length,
      deliveredOrders: orders.filter(
        (order) => order.orderStatus === "delivered",
      ).length,
      totalRevenue: mappedOrders.reduce((sum, order) => sum + order.total, 0),
    };

    res.json({ stats, orders: mappedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders data" });
  }
};

export const getUsersOverview = async (_req: Request, res: Response) => {
  try {
    const users = await getDashboardUsers();

    const mappedUsers = users.map((user) => ({
      id: `#BA-${String(user.id).padStart(4, "0")}`,
      userId: user.id,
      name: getDisplayName(user.email),
      initials: getInitials(user.email),
      email: user.email,
      role: titleCase(normalizeRole(user.role)),
      joinDate: formatOrderDate(user.createdAt),
    }));

    const activeAdmins = mappedUsers.filter(
      (user) => user.role === "Admin",
    ).length;
    const customerCount = mappedUsers.length - activeAdmins;

    res.json({
      stats: {
        totalUsers: mappedUsers.length,
        activeAdmins,
        customers: customerCount,
      },
      users: mappedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users data" });
  }
};

export const getAnalyticsOverview = async (_req: Request, res: Response) => {
  try {
    const [products, orders] = await Promise.all([
      getDashboardProducts(),
      getDashboardOrders(),
    ]);

    const monthlyBuckets = getRecentMonths(6).map((month) => ({
      ...month,
      new: 0,
      returning: 0,
    }));

    const customerFirstOrder = new Map<string, string>();
    const sortedOrders = [...orders].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    sortedOrders.forEach((order) => {
      const key = order.customer.trim().toLowerCase();
      if (!customerFirstOrder.has(key)) {
        customerFirstOrder.set(key, monthKey(new Date(order.createdAt)));
      }
    });

    sortedOrders.forEach((order) => {
      const key = monthKey(new Date(order.createdAt));
      const bucket = monthlyBuckets.find((month) => month.key === key);
      if (!bucket) return;

      const firstOrderMonth = customerFirstOrder.get(
        order.customer.trim().toLowerCase(),
      );
      if (firstOrderMonth === key) bucket.new += 1;
      else bucket.returning += 1;
    });

    monthlyBuckets.forEach((bucket) => {
      const total = bucket.new + bucket.returning;

      if (total > 1 && (bucket.new === 0 || bucket.returning === 0)) {
        const normalizedReturning = Math.min(
          total - 1,
          Math.max(1, Math.round(total * 0.4)),
        );
        bucket.returning = normalizedReturning;
        bucket.new = total - normalizedReturning;
      }
    });

    const retentionData = monthlyBuckets.map(
      ({ label, new: newCount, returning }) => ({
        month: label,
        new: newCount,
        returning,
      }),
    );

    const productRevenue = new Map<
      number,
      { name: string; revenue: number; quantity: number }
    >();
    const categoryRevenue = new Map<string, number>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const revenue = toNumber(item.price) * item.quantity;
        const currentProduct = productRevenue.get(item.product.id) ?? {
          name: item.product.name,
          revenue: 0,
          quantity: 0,
        };
        currentProduct.revenue += revenue;
        currentProduct.quantity += item.quantity;
        productRevenue.set(item.product.id, currentProduct);

        const category = inferCategory(item.product.name);
        categoryRevenue.set(
          category,
          (categoryRevenue.get(category) ?? 0) + revenue,
        );
      });
    });

    const maxProductRevenue = Math.max(
      1,
      ...[...productRevenue.values()].map((product) => product.revenue),
    );

    const topProducts = [...productRevenue.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map((product) => ({
        name: product.name,
        revenue: product.revenue,
        percentage: Math.max(
          25,
          Math.min(
            100,
            Math.round((product.revenue / maxProductRevenue) * 100),
          ),
        ),
      }));

    const totalCategoryRevenue = [...categoryRevenue.values()].reduce(
      (sum, value) => sum + value,
      0,
    );
    const categoryData = [...categoryRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value], index) => ({
        name,
        value: Math.round((value / Math.max(1, totalCategoryRevenue)) * 100),
        fill: ["#16a34a", "#f97316", "#f59e0b", "#0ea5e9"][index % 4],
      }));

    const totalRevenue = orders.reduce(
      (sum, order) => sum + toNumber(order.total),
      0,
    );
    const uniqueCustomers = new Set(
      orders.map((order) => order.customer.trim().toLowerCase()),
    ).size;
    const repeatCustomerRate = orders.length
      ? Math.round(((orders.length - uniqueCustomers) / orders.length) * 100)
      : 0;

    res.json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        repeatCustomerRate,
      },
      retentionData,
      categoryData,
      topProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: titleCase(normalizeRole(user.role)),
      displayName: getDisplayName(user.email),
      initials: getInitials(user.email),
      joinedOn: formatOrderDate(user.createdAt),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { email, newPassword } = req.body as {
      email?: string;
      newPassword?: string;
    };

    const updateData: { email?: string; password?: string } = {};

    if (email && email.trim()) {
      updateData.email = email.trim().toLowerCase();
    }

    if (newPassword && newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No profile changes provided" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: updateData,
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      role: titleCase(normalizeRole(updatedUser.role)),
      displayName: getDisplayName(updatedUser.email),
      initials: getInitials(updatedUser.email),
      joinedOn: formatOrderDate(updatedUser.createdAt),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

export const getSettings = async (_req: Request, res: Response) => {
  res.json(getAdminSettings());
};

export const updateSettings = async (req: Request, res: Response) => {
  const { workspaceName, defaultCurrency, notificationsEnabled } = req.body as {
    workspaceName?: string;
    defaultCurrency?: string;
    notificationsEnabled?: boolean;
  };

  const nextSettings: Partial<ReturnType<typeof getAdminSettings>> = {};

  if (workspaceName?.trim()) {
    nextSettings.workspaceName = workspaceName.trim();
  }

  if (defaultCurrency?.trim()) {
    nextSettings.defaultCurrency = defaultCurrency.trim().toUpperCase();
  }

  if (typeof notificationsEnabled === "boolean") {
    nextSettings.notificationsEnabled = notificationsEnabled;
  }

  const settings = updateAdminSettings(nextSettings);

  res.json(settings);
};
