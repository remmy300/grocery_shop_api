import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSettings,
} from "../lib/adminSettings.js";

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

const relativeTime = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

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

    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "completed")
      .reduce((sum, order) => sum + toNumber(order.total), 0);
    const totalProducts = products.length;
    const lowStockItems = products.filter(
      (product) => product.stock > 0 && product.stock <= ((product as any).lowStockThreshold ?? 10),
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

    const recentActivity = orders.map((order) => ({
      id: order.id,
      user: order.customer,
      action: "placed an order",
      item: `Order #${order.id}`,
      createdAt: new Date(order.createdAt).toISOString(),
      initials: getInitials(order.customer),
    }));

    // Low-stock product details for dashboard alerts
    const lowStockProducts = products
      .filter((p) => p.stock > 0 && p.stock <= ((p as any).lowStockThreshold ?? 10))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, unit: (p as any).unit ?? "units", category: p.category }));

    const outOfStockProducts = products
      .filter((p) => p.stock <= 0)
      .map((p) => ({ id: p.id, name: p.name, stock: 0, category: p.category }));

    // Best-selling products (by units sold across all orders)
    const salesMap = new Map<number, { name: string; category: string; unitsSold: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const existing = salesMap.get(item.product.id) ?? {
          name: item.product.name,
          category: item.product.category || inferCategory(item.product.name),
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += item.quantity;
        existing.revenue += toNumber(item.price) * item.quantity;
        salesMap.set(item.product.id, existing);
      });
    });
    const topSellingProducts = [...salesMap.values()]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

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
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getInventoryOverview = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
    const skip = (page - 1) * limit;

    const [allProducts, pagedProducts, total] = await Promise.all([
      getDashboardProducts(), // for stats only
      prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: { deletedAt: null } }),
    ]);

    const mappedProducts = pagedProducts.map((product: ProductType) => {
      const threshold = (product as any).lowStockThreshold ?? 10;
      return {
        id: product.id,
        sku: `#ARC-${String(product.id).padStart(4, "0")}`,
        name: product.name,
        category: product.category || inferCategory(product.name),
        unit: (product as any).unit ?? "per piece",
        stock: product.stock,
        lowStockThreshold: threshold,
        stockStatus:
          product.stock <= 0
            ? "Out of Stock"
            : product.stock <= threshold
              ? "Low Stock"
              : "In Stock",
        price: toNumber(product.price),
        imageUrl: product.imageUrl,
      };
    });

    const totalProducts = allProducts.length;
    const lowStockItems = allProducts.filter((p: ProductType) => p.stock > 0 && p.stock <= ((p as any).lowStockThreshold ?? 10)).length;
    const outOfStockItems = allProducts.filter((p: ProductType) => p.stock <= 0).length;
    const inventoryValue = allProducts.reduce(
      (sum: number, p: ProductType) => sum + p.stock * toNumber(p.price),
      0,
    );

    res.json({
      stats: { totalProducts, lowStockItems, outOfStockItems, inventoryValue },
      products: mappedProducts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch inventory data" });
  }
};

export const getOrdersOverview = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: any = status ? { orderStatus: status } : {};

    const [orderTotal, rawOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);
    const orders = rawOrders as OrderWithItems[];

    const mappedOrders = orders.map((order: OrderWithItems) => {
      const orderStatus = titleCase(order.orderStatus || "pending");
      return {
        id: `#ARC-${String(order.id).padStart(4, "0")}`,
        orderId: order.id,
        customer: order.customer,
        phone: order.phone,
        address: order.address,
        street: order.street,
        city: order.city,
        postalCode: order.postalCode,
        latitude: order.latitude ?? null,
        longitude: order.longitude ?? null,
        date: formatOrderDate(new Date(order.createdAt)),
        total: toNumber(order.total),
        orderStatus,
        itemCount: order.items.length,
        initials: getInitials(order.customer),
        statusColor:
          order.orderStatus === "delivered"
            ? "bg-surface-container-highest text-on-surface-variant"
            : order.orderStatus === "out_for_delivery"
              ? "bg-primary-fixed text-on-primary-fixed-variant"
              : order.orderStatus === "confirmed"
                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                : "bg-secondary-fixed text-on-secondary-fixed-variant",
        items: order.items.map(
          (item: { product: ProductType; quantity: number; price: unknown }) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: toNumber(item.price),
          }),
        ),
      };
    });

    const stats = {
      totalOrders: orderTotal,
      pendingOrders: orders.filter((o: OrderWithItems) => o.orderStatus === "pending").length,
      shippedOrders: orders.filter((o: OrderWithItems) => o.orderStatus === "out_for_delivery").length,
      deliveredOrders: orders.filter((o: OrderWithItems) => o.orderStatus === "delivered").length,
      totalRevenue: orders
        .filter((o: OrderWithItems) => o.paymentStatus === "completed")
        .reduce((sum: number, o: OrderWithItems) => sum + toNumber(o.total), 0),
    };

    res.json({
      stats,
      orders: mappedOrders,
      pagination: { page, limit, total: orderTotal, pages: Math.ceil(orderTotal / limit) },
    });
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
      order.items.forEach(
        (item: { product: ProductType; quantity: number; price: unknown }) => {
          const revenue = toNumber(item.price) * item.quantity;
          const currentProduct = productRevenue.get(item.product.id) ?? {
            name: item.product.name,
            revenue: 0,
            quantity: 0,
          };
          currentProduct.revenue += revenue;
          currentProduct.quantity += item.quantity;
          productRevenue.set(item.product.id, currentProduct);

          // Use the stored category directly; fall back to inferCategory only if missing
          const category = item.product.category || inferCategory(item.product.name);
          categoryRevenue.set(
            category,
            (categoryRevenue.get(category) ?? 0) + revenue,
          );
        },
      );
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
        percentage: Math.min(
          100,
          Math.round((product.revenue / maxProductRevenue) * 100),
        ),
      }));

    const totalCategoryRevenue = [...categoryRevenue.values()].reduce(
      (sum, value) => sum + value,
      0,
    );
    const PIE_COLORS = [
      "#16a34a", "#f97316", "#f59e0b", "#0ea5e9",
      "#8b5cf6", "#ec4899", "#14b8a6", "#ef4444",
      "#84cc16", "#f43f5e", "#06b6d4", "#a855f7",
    ];
    const categoryData = [...categoryRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value: Math.round((value / Math.max(1, totalCategoryRevenue)) * 100),
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }));

    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "completed")
      .reduce((sum, order) => sum + toNumber(order.total), 0);

    const orderCountByCustomer = new Map<string, number>();
    orders.forEach((order) => {
      const key = order.customer.trim().toLowerCase();
      orderCountByCustomer.set(key, (orderCountByCustomer.get(key) ?? 0) + 1);
    });
    const uniqueCustomers = orderCountByCustomer.size;
    const repeatCustomers = [...orderCountByCustomer.values()].filter(
      (count) => count > 1,
    ).length;
    const repeatCustomerRate = uniqueCustomers
      ? Math.round((repeatCustomers / uniqueCustomers) * 100)
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

export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getAdminSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getAdminSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const {
      workspaceName,
      defaultCurrency,
      notificationsEnabled,
      timezone,
      language,
      lowStockThreshold,
      orderAutoCancelHours,
      deliveryFee,
      supportEmail,
      supportPhone,
      taxRate,
      minOrderAmount,
      freeDeliveryThreshold,
      deliveryTimeWindow,
      deliveryRadiusKm,
      mpesaEnabled,
      codEnabled,
      allowRegistration,
      hideOutOfStock,
      storeTagline,
      announcementBanner,
      storeOpen,
    } = req.body as {
      workspaceName?: string;
      defaultCurrency?: string;
      notificationsEnabled?: boolean;
      timezone?: string;
      language?: string;
      lowStockThreshold?: number;
      orderAutoCancelHours?: number;
      deliveryFee?: number;
      supportEmail?: string;
      supportPhone?: string;
      taxRate?: number;
      minOrderAmount?: number;
      freeDeliveryThreshold?: number;
      deliveryTimeWindow?: string;
      deliveryRadiusKm?: number;
      mpesaEnabled?: boolean;
      codEnabled?: boolean;
      allowRegistration?: boolean;
      hideOutOfStock?: boolean;
      storeTagline?: string;
      announcementBanner?: string;
      storeOpen?: boolean;
    };

    const nextSettings: Partial<AdminSettings> = {};

    if (workspaceName?.trim()) {
      nextSettings.workspaceName = workspaceName.trim();
    }

    if (defaultCurrency?.trim()) {
      nextSettings.defaultCurrency = defaultCurrency.trim().toUpperCase();
    }

    if (typeof notificationsEnabled === "boolean") {
      nextSettings.notificationsEnabled = notificationsEnabled;
    }

    if (timezone?.trim()) {
      nextSettings.timezone = timezone.trim();
    }

    if (language === "en" || language === "sw") {
      nextSettings.language = language;
    }

    if (
      typeof lowStockThreshold === "number" &&
      Number.isFinite(lowStockThreshold)
    ) {
      nextSettings.lowStockThreshold = lowStockThreshold;
    }

    if (
      typeof orderAutoCancelHours === "number" &&
      Number.isFinite(orderAutoCancelHours)
    ) {
      nextSettings.orderAutoCancelHours = orderAutoCancelHours;
    }

    if (typeof deliveryFee === "number" && Number.isFinite(deliveryFee)) {
      nextSettings.deliveryFee = deliveryFee;
    }

    if (typeof supportEmail === "string") {
      nextSettings.supportEmail = supportEmail.trim();
    }

    if (typeof supportPhone === "string") {
      nextSettings.supportPhone = supportPhone.trim();
    }

    if (typeof taxRate === "number" && Number.isFinite(taxRate)) {
      nextSettings.taxRate = taxRate;
    }

    if (typeof minOrderAmount === "number" && Number.isFinite(minOrderAmount)) {
      nextSettings.minOrderAmount = minOrderAmount;
    }

    if (
      typeof freeDeliveryThreshold === "number" &&
      Number.isFinite(freeDeliveryThreshold)
    ) {
      nextSettings.freeDeliveryThreshold = freeDeliveryThreshold;
    }

    if (typeof deliveryTimeWindow === "string") {
      nextSettings.deliveryTimeWindow = deliveryTimeWindow.trim();
    }

    if (typeof deliveryRadiusKm === "number" && Number.isFinite(deliveryRadiusKm)) {
      nextSettings.deliveryRadiusKm = deliveryRadiusKm;
    }

    if (typeof mpesaEnabled === "boolean") {
      nextSettings.mpesaEnabled = mpesaEnabled;
    }

    if (typeof codEnabled === "boolean") {
      nextSettings.codEnabled = codEnabled;
    }

    if (typeof allowRegistration === "boolean") {
      nextSettings.allowRegistration = allowRegistration;
    }

    if (typeof hideOutOfStock === "boolean") {
      nextSettings.hideOutOfStock = hideOutOfStock;
    }

    if (typeof storeTagline === "string") {
      nextSettings.storeTagline = storeTagline.trim();
    }

    if (typeof announcementBanner === "string") {
      nextSettings.announcementBanner = announcementBanner.trim();
    }

    if (typeof storeOpen === "boolean") {
      nextSettings.storeOpen = storeOpen;
    }

    const settings = await updateAdminSettings(nextSettings);

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};
