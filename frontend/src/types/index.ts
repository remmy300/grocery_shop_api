import { AxiosRequestConfig } from "axios";

export type ApiRequestOptions = Omit<AxiosRequestConfig, "url" | "data"> & {
  json?: unknown;
};

export type BackendProduct = {
  id: number;
  name: string;
  category?: string | null;
  price: number | string;
  stock: number;
  imageUrl?: string | null;
  deletedAt?: string | null;
};

export type BackendOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  price: number | string;
  quantity: number;
};

export type BackendOrder = {
  id: number;
  customer: string;
  phone: string;
  address: string;
  total: number | string;
  orderStatus: string;
  items?: BackendOrderItem[];
  createdAt: string;
};

export type BackendUser = {
  id: number | string;
  email: string;
  role: string;
};

export type BackendAdmin = {
  id: number;
  email: string;
  role: string;
};

export type DashboardResponse = {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockItems: number;
    activeAdmins: number;
    activeCustomers: number;
    ordersToday: number;
  };
  recentActivity: Array<{
    id: number;
    user: string;
    action: string;
    item: string;
    time: string;
    initials: string;
  }>;
  revenueData: Array<{ month: string; revenue: number }>;
};

export type InventoryResponse = {
  stats: {
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
  };
  products: Array<{
    id: number;
    sku: string;
    name: string;
    category: string;
    stock: number;
    stockStatus: string;
    price: number;
    imageUrl?: string | null;
  }>;
};

export type OrdersResponse = {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  };
  orders: Array<{
    id: string;
    orderId: number;
    customer: string;
    date: string;
    total: number;
    orderStatus: string;
    itemCount: number;
    initials: string;
    statusColor: string;
  }>;
};

export type UsersResponse = {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    customers: number;
  };
  users: Array<{
    id: string;
    userId: number;
    name: string;
    initials: string;
    email: string;
    role: string;
    joinDate: string;
  }>;
};

export type AnalyticsResponse = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    repeatCustomerRate: number;
  };
  retentionData: Array<{
    month: string;
    new: number;
    returning: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    percentage: number;
  }>;
};

export type CloudinarySignatureResponse = {
  apiKey: string;
  cloudName: string;
  signature?: string;
};

export type SettingsResponse = {
  workspaceName: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  updatedAt: string;
};

export type ProfileResponse = {
  id: number;
  email: string;
  role: string;
  displayName: string;
  initials: string;
  joinedOn: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type DeliveryMethod = "standard" | "express";

export type PaymentMethod = "card" | "mpesa" | "paypal" | "stripe";

export type CheckoutState = {
  deliveryMethod: DeliveryMethod | null;
  paymentMethod: PaymentMethod | null;

  address: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
    notes?: string;
  } | null;

  location: {
    lat: number;
    lng: number;
  } | null;
};
