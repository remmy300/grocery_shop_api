import { AxiosRequestConfig } from "axios";

export interface Entity {
  id: number | string;
  name: string;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

export interface ProductStockSummary {
  id: number;
  name: string;
  stock: number;
  category: string;
  unit?: string;
}

export interface BackendUser {
  id: number;
  email: string;
  role: string;
}

export type BackendAdmin = BackendUser;

export type ApiRequestOptions = Omit<AxiosRequestConfig, "url" | "data"> & {
  json?: unknown;
};

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string | null;
  lowStockThreshold: number;
}

export type BackendProduct = Omit<Product, "price"> & {
  price: number | string;
};

export interface InventoryProduct extends Product {
  sku: string;
  stockStatus: string;
}

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

export interface DashboardSummaryMetrics extends BusinessMetrics {
  lowStockItems: number;
  activeAdmins: number;
  activeCustomers: number;
  ordersToday: number;
}

export interface DashboardMetrics extends DashboardSummaryMetrics {
  recentActivity: Array<{
    id: number;
    user: string;
    action: string;
    item: string;
    createdAt: string;
    initials: string;
  }>;
  revenueData: Array<{ month: string; revenue: number }>;
  lowStockProducts: ProductStockSummary[];
  outOfStockProducts: ProductStockSummary[];
  topSellingProducts: Array<{
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export type DashboardOverviewResponse = Omit<
  DashboardMetrics,
  keyof DashboardSummaryMetrics
> & {
  metrics: DashboardSummaryMetrics;
};

export type InventoryResponse = {
  stats: {
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
  };
  products: InventoryProduct[];
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

export interface AnalyticsSummaryMetrics extends BusinessMetrics {
  repeatCustomerRate: number;
}

export interface AnalyticsResponse extends AnalyticsSummaryMetrics {
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
}

export type AnalyticsOverviewResponse = Omit<
  AnalyticsResponse,
  keyof AnalyticsSummaryMetrics
> & {
  summary: AnalyticsSummaryMetrics;
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

export type ProductFormState = {
  name: string;
  category: string;
  unit: string;
  stock: string;
  price: string;
  imageUrl: string;
  lowStockThreshold: string;
};
