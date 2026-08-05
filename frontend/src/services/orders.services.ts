import { OrdersResponse, BackendOrder, ApiError } from "@/types";
import { fetchJson } from "@/lib/api";
import { formatDate, initialsFrom, toNumber } from "@/utils/formatters";

const statusTone = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "delivered") {
    return "bg-surface-container-highest text-on-surface-variant";
  }

  if (normalized === "shipped") {
    return "bg-primary-fixed text-on-primary-fixed-variant";
  }

  if (normalized === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-secondary-fixed text-on-secondary-fixed-variant";
};

export const buildOrdersResponse = async (): Promise<OrdersResponse> => {
  const orders = await fetchJson<BackendOrder[]>("/api/orders");

  if (!orders.length) {
    throw new ApiError("Unable to load orders data", 500);
  }

  const ordered = [...orders].sort(
    (left, right) => +new Date(right.createdAt) - +new Date(left.createdAt),
  );

  return {
    stats: {
      totalOrders: orders.length,
      pendingOrders: orders.filter(
        (order) => order.orderStatus.toLowerCase() === "pending",
      ).length,
      shippedOrders: orders.filter(
        (order) => order.orderStatus.toLowerCase() === "shipped",
      ).length,
      deliveredOrders: orders.filter(
        (order) => order.orderStatus.toLowerCase() === "delivered",
      ).length,
      totalRevenue: orders.reduce(
        (sum, order) => sum + toNumber(order.total),
        0,
      ),
    },
    orders: ordered.map((order) => ({
      id: `#ARC-${String(order.id).padStart(4, "0")}`,
      orderId: order.id,
      customer: order.customer,
      phone: order.phone,
      address: order.address,
      street: order.street ?? null,
      city: order.city ?? null,
      postalCode: order.postalCode ?? null,
      latitude: order.latitude ?? null,
      longitude: order.longitude ?? null,
      date: formatDate(order.createdAt),
      total: toNumber(order.total),
      orderStatus: order.orderStatus,
      itemCount:
        order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
      initials: initialsFrom(order.customer),
      statusColor: statusTone(order.orderStatus),
    })),
  };
};
