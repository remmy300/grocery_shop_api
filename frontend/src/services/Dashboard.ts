import {
  DashboardMetrics,
  Product,
  BackendAdmin,
  BackendOrder,
  ApiError,
} from "@/types";
import { fetchJson } from "@/lib/api";
import { initialsFrom, toNumber } from "@/utils/formatters";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const buildDashboardResponse = async (): Promise<DashboardMetrics> => {
  const [productsResult, ordersResult, adminsResult] = await Promise.allSettled(
    [
      fetchJson<Product[]>("/api/products"),
      fetchJson<BackendOrder[]>("/api/orders"),
      fetchJson<BackendAdmin[]>("/api/auth/admins"),
    ],
  );

  const products =
    productsResult.status === "fulfilled" ? productsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  const admins = adminsResult.status === "fulfilled" ? adminsResult.value : [];

  if (!products.length && !orders.length) {
    throw new ApiError("Unable to load dashboard data", 500);
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + toNumber(order.total),
    0,
  );
  const activeCustomers = new Set(
    orders.map((order) => order.customer.trim().toLowerCase()),
  ).size;
  const today = new Date();
  const ordersToday = orders.filter((order) => {
    const date = new Date(order.createdAt);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }).length;

  const revenueData = monthLabels.map((month, index) => ({
    month,
    revenue: orders
      .filter((order) => new Date(order.createdAt).getMonth() === index)
      .reduce((sum, order) => sum + toNumber(order.total), 0),
  }));

  const recentActivity = [...orders]
    .sort(
      (left, right) => +new Date(right.createdAt) - +new Date(left.createdAt),
    )
    .slice(0, 4)
    .map((order) => ({
      id: order.id,
      user: order.customer,
      action: "placed an order",
      item: `Order #${order.id}`,
      createdAt: new Date(order.createdAt).toISOString(),
      initials: initialsFrom(order.customer),
    }));

  const lowStockProducts = products
    .filter((product) => product.stock > 0 && product.stock <= 20)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      unit: product.unit ?? "pcs",
      category: product.category ?? "General Grocery",
    }));

  const outOfStockProducts = products
    .filter((product) => product.stock === 0)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      category: product.category ?? "General Grocery",
    }));

  const salesMap = new Map<
    number,
    {
      name: string;
      category: string;
      unitsSold: number;
      revenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) continue;

      const existing = salesMap.get(product.id);

      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += item.quantity * toNumber(item.price);
      } else {
        salesMap.set(product.id, {
          name: product.name,
          category: product.category ?? "General Grocery",
          unitsSold: item.quantity,
          revenue: item.quantity * toNumber(item.price),
        });
      }
    }
  }

  const topSellingProducts = Array.from(salesMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockItems: products.filter((product) => product.stock <= 20).length,
    activeAdmins: admins.length,
    activeCustomers,
    ordersToday,
    recentActivity,
    revenueData,
    lowStockProducts,
    outOfStockProducts,
    topSellingProducts,
  };
};
