import axios, { AxiosRequestConfig } from "axios";
import { buildDashboardResponse } from "@/services/Dashboard";
import { buildInventoryResponse } from "@/services/inventory.services";
import { buildOrdersResponse } from "@/services/orders.services";
import { buildAnalyticsResponse } from "@/services/analytics.services";
import { buildUsersResponse } from "@/services/users.services";
import {
  getStoredSettings,
  saveStoredProfile,
} from "@/services/storage.services";
import { getSyntheticProfile, saveSettings } from "@/services/profile.services";
import { mergeProfile } from "@/services/profile.services";
import { initialsFrom, displayNameFromEmail } from "@/utils/formatters";
import { getAuthToken } from "@/services/auth.services";
import {
  ApiRequestOptions,
  Settings,
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
        //  Clear session and redirect to login
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

export const fetchJson = async <T>(
  path: string,
  options: ApiRequestOptions = {},
) => {
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
        (options.json as Partial<Settings>) || {},
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
