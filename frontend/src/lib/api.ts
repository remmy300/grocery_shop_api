import axios, { AxiosRequestConfig } from "axios";
import {
  ApiRequestOptions,
  BackendProduct,
  BackendOrder,
  BackendUser,
  BackendAdmin,
  DashboardResponse,
  InventoryResponse,
  OrdersResponse,
  UsersResponse,
  AnalyticsResponse,
  SettingsResponse,
  ProfileResponse,
  ApiError,
} from "@/types";

export const getApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured in production. Set it to your deployed backend API origin.",
    );
  }

  return "http://localhost:4000";
};

export const API_BASE_URL = getApiBaseUrl();

const SETTINGS_STORAGE_KEY = "corner-store-admin-settings";
const PROFILE_STORAGE_KEY = "corner-store-profile";

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

export const hasStoredAccessToken = () => Boolean(getAuthToken());

export const saveSessionTokens = (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
};

const createAxiosConfig = (options: ApiRequestOptions = {}) => {
  const { headers, json, ...requestOptions } = options;
  const config: AxiosRequestConfig = {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  const token = getAuthToken();
  if (token && !config.headers?.Authorization) {
    config.headers!.Authorization = `Bearer ${token}`;
  } else if (!token) {
    console.warn(
      " No auth token found in localStorage. Available keys:",
      Object.keys(localStorage),
    );
  }

  if (json !== undefined) {
    config.data = json;
    if (!config.headers?.["Content-Type"]) {
      config.headers!["Content-Type"] = "application/json";
    }
  }

  return config;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to log outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = config.headers.Authorization;
    const authPreview =
      typeof authHeader === "string"
        ? `${authHeader.substring(0, 20)}...`
        : authHeader
          ? "SET"
          : "NONE";

    console.log(" API Request:", {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasAuth: !!authHeader,
      authToken: authPreview,
    });
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      // Log errors for debugging
      const errorDetails = {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
        hasAuthHeader: !!error.config?.headers.Authorization,
      };

      console.error("API Error:", errorDetails);

      // Handle 401 - Token might be expired, refresh or redirect to login
      if (error.response?.status === 401) {
        console.warn(
          "Unauthorized (401) - Token may have expired or be invalid",
        );
        console.warn("Response data:", error.response.data);
        // Optional: Clear session and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }

      // Handle 500 - Server error
      if (error.response?.status === 500) {
        console.error("Server Error (500):", error.response.data?.message);
      }
    }

    return Promise.reject(error);
  },
);

const fetchJson = async <T>(path: string, options: ApiRequestOptions = {}) => {
  const config = createAxiosConfig(options);
  try {
    const response = await axiosInstance(path, config);
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Request failed with status ${statusCode}`;

      throw new ApiError(message, statusCode);
    }
    throw error;
  }
};

const getStoredSettings = (): SettingsResponse => {
  if (typeof window === "undefined") {
    return {
      workspaceName: "Corner Store",
      defaultCurrency: "USD",
      notificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  }

  const fallback: SettingsResponse = {
    workspaceName: "Corner Store",
    defaultCurrency: "USD",
    notificationsEnabled: true,
    updatedAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsResponse>;
    return {
      workspaceName: parsed.workspaceName || fallback.workspaceName,
      defaultCurrency: parsed.defaultCurrency || fallback.defaultCurrency,
      notificationsEnabled:
        typeof parsed.notificationsEnabled === "boolean"
          ? parsed.notificationsEnabled
          : fallback.notificationsEnabled,
      updatedAt: parsed.updatedAt || fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
};

const getStoredProfile = (): Partial<ProfileResponse> => {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Partial<ProfileResponse>;
  } catch {
    return {};
  }
};

const saveStoredProfile = (profile: Partial<ProfileResponse>) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextProfile = {
    ...getStoredProfile(),
    ...profile,
  };

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") return;

  ["accessToken", "token", "refreshToken", PROFILE_STORAGE_KEY].forEach(
    (key) => localStorage.removeItem(key),
  );

  // Clear the HttpOnly cookie by calling the logout endpoint (fire-and-forget)
  fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
};

const DEMO_PROFILE: ProfileResponse = {
  id: 1,
  email: "jenta@admin.com",
  role: "admin",
  displayName: "Jenta",
  initials: "J",
  joinedOn: "Current session",
};

const mergeProfile = (profile: Partial<ProfileResponse>): ProfileResponse => {
  const email = profile.email || DEMO_PROFILE.email;
  const displayName =
    profile.displayName ||
    displayNameFromEmail(email) ||
    DEMO_PROFILE.displayName;

  return {
    ...DEMO_PROFILE,
    ...profile,
    id: profile.id ?? DEMO_PROFILE.id,
    email,
    role: profile.role || DEMO_PROFILE.role,
    displayName,
    initials:
      profile.initials || initialsFrom(displayName) || DEMO_PROFILE.initials,
    joinedOn: profile.joinedOn || DEMO_PROFILE.joinedOn,
  };
};

const getSyntheticProfile = () => mergeProfile(getStoredProfile());

const saveSettings = (settings: Partial<SettingsResponse>) => {
  if (typeof window === "undefined") {
    return getStoredSettings();
  }

  const nextSettings: SettingsResponse = {
    ...getStoredSettings(),
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  return nextSettings;
};

const toNumber = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatDate = (
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) => {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const formatRelativeTime = (value: string | Date | null | undefined) => {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffInSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absoluteDiff = Math.abs(diffInSeconds);

  if (absoluteDiff < 60) {
    return "Just now";
  }

  if (absoluteDiff < 3600) {
    return `${Math.round(absoluteDiff / 60)} minutes ago`;
  }

  if (absoluteDiff < 86400) {
    return `${Math.round(absoluteDiff / 3600)} hours ago`;
  }

  if (absoluteDiff < 604800) {
    return `${Math.round(absoluteDiff / 86400)} days ago`;
  }

  return formatDate(date);
};

const displayNameFromEmail = (email: string) => {
  const localPart = email.split("@")[0] || email;

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const initialsFrom = (value: string) => {
  const words = value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initials =
    words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("") || value.slice(0, 2);

  return initials.toUpperCase();
};

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ".");

const productCategory = (name: string) => {
  const lower = name.toLowerCase();

  if (/(milk|cheese|yogurt|butter|cream|dairy)/.test(lower)) {
    return "Dairy";
  }

  if (/(bread|cake|pastry|deli|bakery)/.test(lower)) {
    return "Bakery & Deli";
  }

  if (
    /(apple|banana|orange|berry|carrot|lettuce|tomato|avocado|fruit|produce|vegetable)/.test(
      lower,
    )
  ) {
    return "Produce";
  }

  return "General Grocery";
};

const stockStatus = (stock: number) => {
  if (stock <= 0) {
    return "Out of Stock";
  }

  if (stock <= 20) {
    return "Low Stock";
  }

  return "In Stock";
};

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

const buildDashboardResponse = async (): Promise<DashboardResponse> => {
  const [productsResult, ordersResult, adminsResult] = await Promise.allSettled(
    [
      fetchJson<BackendProduct[]>("/api/products"),
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

  return {
    metrics: {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockItems: products.filter((product) => product.stock <= 20).length,
      activeAdmins: admins.length,
      activeCustomers,
      ordersToday,
    },
    recentActivity,
    revenueData,
  };
};

const buildInventoryResponse = async (): Promise<InventoryResponse> => {
  const products = await fetchJson<BackendProduct[]>("/api/products");

  if (!products.length) {
    throw new ApiError("Unable to load inventory data", 500);
  }

  const inventoryValue = products.reduce(
    (sum, product) => sum + toNumber(product.price) * product.stock,
    0,
  );

  return {
    stats: {
      totalProducts: products.length,
      lowStockItems: products.filter((product) => product.stock <= 20).length,
      inventoryValue,
    },
    products: products.map((product) => ({
      id: product.id,
      sku: `#PRD-${String(product.id).padStart(4, "0")}`,
      name: product.name,
      category: product.category || productCategory(product.name),
      unit: product.unit || "per piece",
      stock: product.stock,
      stockStatus: stockStatus(product.stock),
      price: toNumber(product.price),
      imageUrl: product.imageUrl ?? null,
    })),
  };
};

const buildOrdersResponse = async (): Promise<OrdersResponse> => {
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

const buildUsersResponse = async (): Promise<UsersResponse> => {
  const [currentUserResult, adminsResult, ordersResult] =
    await Promise.allSettled([
      fetchJson<BackendUser>("/api/auth/me"),
      fetchJson<BackendAdmin[]>("/api/auth/admins"),
      fetchJson<BackendOrder[]>("/api/orders"),
    ]);

  const currentUser =
    currentUserResult.status === "fulfilled" ? currentUserResult.value : null;
  const admins = adminsResult.status === "fulfilled" ? adminsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];

  if (!currentUser && !admins.length && !orders.length) {
    throw new ApiError("Unable to load users data", 500);
  }

  const users: UsersResponse["users"] = [];
  const seenEmails = new Set<string>();

  if (currentUser) {
    users.push({
      id: `#ME-${String(currentUser.id).padStart(4, "0")}`,
      userId: Number(currentUser.id) || 0,
      name: displayNameFromEmail(currentUser.email),
      initials: initialsFrom(displayNameFromEmail(currentUser.email)),
      email: currentUser.email,
      role: currentUser.role === "admin" ? "Admin" : "User",
      joinDate: "Current account",
    });
    seenEmails.add(currentUser.email.toLowerCase());
  }

  admins.forEach((admin) => {
    const key = admin.email.toLowerCase();
    if (seenEmails.has(key)) {
      return;
    }

    users.push({
      id: `#BA-${String(admin.id).padStart(4, "0")}`,
      userId: admin.id,
      name: displayNameFromEmail(admin.email),
      initials: initialsFrom(displayNameFromEmail(admin.email)),
      email: admin.email,
      role: "Admin",
      joinDate: "Admin account",
    });
    seenEmails.add(key);
  });

  const seenCustomers = new Set<string>();
  orders.forEach((order) => {
    const key = `${order.customer.toLowerCase()}|${order.phone}`;
    if (seenCustomers.has(key)) {
      return;
    }
    seenCustomers.add(key);

    users.push({
      id: `#CU-${String(order.id).padStart(4, "0")}`,
      userId: order.id,
      name: order.customer,
      initials: initialsFrom(order.customer),
      email: `${slugify(order.customer)}@customers.local`,
      role: "Customer",
      joinDate: formatDate(order.createdAt),
    });
  });

  return {
    stats: {
      totalUsers: users.length,
      activeAdmins: users.filter((user) => user.role === "Admin").length,
      customers: users.filter((user) => user.role === "Customer").length,
    },
    users,
  };
};

const buildAnalyticsResponse = async (): Promise<AnalyticsResponse> => {
  const [productsResult, ordersResult] = await Promise.allSettled([
    fetchJson<BackendProduct[]>("/api/products"),
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
      const category = product
        ? productCategory(product.name)
        : "General Grocery";
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
    summary: {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      repeatCustomerRate: uniqueCustomers.size
        ? Math.round((repeatCustomers / uniqueCustomers.size) * 100)
        : 0,
    },
    retentionData,
    categoryData,
    topProducts,
  };
};

const ENABLE_DEMO_ADMIN_RESPONSES = false;

const getSyntheticAdminResponse = async (
  path: string,
  options: ApiRequestOptions,
) => {
  if (path === "/api/admin/dashboard") {
    return buildDashboardResponse();
  }

  if (path === "/api/admin/inventory") {
    return buildInventoryResponse();
  }

  if (path === "/api/admin/orders") {
    return buildOrdersResponse();
  }

  if (path === "/api/admin/users") {
    return buildUsersResponse();
  }

  if (path === "/api/admin/analytics") {
    return buildAnalyticsResponse();
  }

  if (path === "/api/admin/settings") {
    if ((options.method || "GET").toUpperCase() === "PUT") {
      const nextSettings = saveSettings(
        (options.json as Partial<SettingsResponse>) || {},
      );
      return nextSettings;
    }

    return getStoredSettings();
  }

  if (path === "/api/admin/profile") {
    if ((options.method || "GET").toUpperCase() === "PATCH") {
      const incoming = (options.json as { email?: string }) || {};
      const currentProfile = getSyntheticProfile();
      const email =
        incoming.email?.trim().toLowerCase() || currentProfile.email;
      const displayName = displayNameFromEmail(email);
      const profile = mergeProfile({
        ...currentProfile,
        email,
        displayName,
        initials: initialsFrom(displayName),
      });

      saveStoredProfile(profile);
      return profile;
    }

    const profile = getSyntheticProfile();

    saveStoredProfile(profile);
    return profile;
  }

  if (path === "/api/admin/profile/password") {
    if ((options.method || "GET").toUpperCase() === "PATCH") {
      return { message: "Password updated successfully." };
    }

    return { message: "Password endpoint ready." };
  }

  return null;
};

export async function apiRequest<T>(
  path: string,
  { headers, json, ...options }: ApiRequestOptions = {},
): Promise<T> {
  if (ENABLE_DEMO_ADMIN_RESPONSES) {
    const synthetic = await getSyntheticAdminResponse(path, {
      headers,
      json,
      ...options,
    });

    if (synthetic !== null) {
      return synthetic as T;
    }
  }

  return fetchJson<T>(path, { headers, json, ...options });
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
