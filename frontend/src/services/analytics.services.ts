import { AnalyticsResponse, BackendOrder, Product, ApiError } from "@/types";
import { fetchJson } from "@/lib/api";
import { toNumber } from "@/utils/formatters";

export const buildAnalyticsResponse = async (): Promise<AnalyticsResponse> => {
  const [productsResult, ordersResult] = await Promise.allSettled([
    fetchJson<Product[]>("/api/products"),
    fetchJson<BackendOrder[]>("/api/orders"),
  ]);

  const products =
    productsResult.status === "fulfilled" ? productsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];

  if (!products.length && !orders.length) {
    throw new ApiError("Unable to load analytics data", 500);
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + toNumber(order.total),
    0,
  );
  const uniqueCustomers = new Set(
    orders.map((order) => order.customer.trim().toLowerCase()),
  );
  const repeatCustomers = orders.length
    ? Math.max(
        0,
        Array.from(uniqueCustomers).filter(
          (customer) =>
            orders.filter(
              (order) => order.customer.trim().toLowerCase() === customer,
            ).length > 1,
        ).length,
      )
    : 0;

  const sortedOrders = [...orders].sort(
    (left, right) => +new Date(left.createdAt) - +new Date(right.createdAt),
  );
  const firstOrderByCustomer = new Map<string, string>();
  sortedOrders.forEach((order) => {
    const key = order.customer.trim().toLowerCase();
    if (!firstOrderByCustomer.has(key)) {
      firstOrderByCustomer.set(
        key,
        `${new Date(order.createdAt).getFullYear()}-${new Date(order.createdAt).getMonth()}`,
      );
    }
  });

  const currentMonth = new Date();
  const retentionData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - (5 - index),
      1,
    );
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    let fresh = 0;
    let returning = 0;

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      if (`${orderDate.getFullYear()}-${orderDate.getMonth()}` !== key) {
        return;
      }

      const customerKey = order.customer.trim().toLowerCase();
      if (firstOrderByCustomer.get(customerKey) === key) {
        fresh += 1;
      } else {
        returning += 1;
      }
    });

    return { month, new: fresh, returning };
  });

  const categoryBuckets = new Map<string, number>();
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const category = product ? "General Grocery" : "";
      categoryBuckets.set(
        category,
        (categoryBuckets.get(category) ?? 0) +
          toNumber(item.price) * item.quantity,
      );
    });
  });

  const categoryPalette: Record<string, string> = {
    Produce: "#16a34a",
    "Bakery & Deli": "#f97316",
    Dairy: "#0ea5e9",
    "General Grocery": "#8b5cf6",
  };

  const categoryData = Array.from(categoryBuckets.entries()).map(
    ([name, value]) => ({
      name,
      value: Math.round(value),
      fill: categoryPalette[name] || "#94a3b8",
    }),
  );

  const revenueByProduct = new Map<number, number>();
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      revenueByProduct.set(
        item.productId,
        (revenueByProduct.get(item.productId) ?? 0) +
          toNumber(item.price) * item.quantity,
      );
    });
  });

  const topProducts = Array.from(revenueByProduct.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([productId, revenue]) => {
      const product = products.find((entry) => entry.id === productId);
      return {
        name: product?.name || `Product #${productId}`,
        revenue: Math.round(revenue),
        percentage: totalRevenue
          ? Math.round((revenue / totalRevenue) * 100)
          : 0,
      };
    });

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    repeatCustomerRate: uniqueCustomers.size
      ? Math.round((repeatCustomers / uniqueCustomers.size) * 100)
      : 0,
    retentionData,
    categoryData,
    topProducts,
  };
};
