import { Settings, ProfileResponse } from "@/types";
import { getApiBaseUrl } from "@/lib/api";

const SETTINGS_STORAGE_KEY = "corner-store-admin-settings";
const PROFILE_STORAGE_KEY = "corner-store-profile";

const DEFAULT_SETTINGS: Settings = {
  workspaceName: "Corner Store",
  defaultCurrency: "KES",
  language: "en",
  timezone: "Africa/Nairobi",
  notificationsEnabled: true,
  lowStockThreshold: 10,
  orderAutoCancelHours: 24,
  deliveryFee: 0,
  supportEmail: "",
  supportPhone: "",
  taxRate: 16,
  updatedAt: new Date().toISOString(),
};

export const getStoredSettings = (): Settings => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      workspaceName: parsed.workspaceName || DEFAULT_SETTINGS.workspaceName,
      defaultCurrency:
        parsed.defaultCurrency || DEFAULT_SETTINGS.defaultCurrency,
      language: parsed.language || DEFAULT_SETTINGS.language,
      timezone: parsed.timezone || DEFAULT_SETTINGS.timezone,
      notificationsEnabled:
        typeof parsed.notificationsEnabled === "boolean"
          ? parsed.notificationsEnabled
          : DEFAULT_SETTINGS.notificationsEnabled,
      lowStockThreshold:
        typeof parsed.lowStockThreshold === "number"
          ? parsed.lowStockThreshold
          : DEFAULT_SETTINGS.lowStockThreshold,
      orderAutoCancelHours:
        typeof parsed.orderAutoCancelHours === "number"
          ? parsed.orderAutoCancelHours
          : DEFAULT_SETTINGS.orderAutoCancelHours,
      deliveryFee:
        typeof parsed.deliveryFee === "number"
          ? parsed.deliveryFee
          : DEFAULT_SETTINGS.deliveryFee,
      supportEmail: parsed.supportEmail ?? DEFAULT_SETTINGS.supportEmail,
      supportPhone: parsed.supportPhone ?? DEFAULT_SETTINGS.supportPhone,
      taxRate:
        typeof parsed.taxRate === "number"
          ? parsed.taxRate
          : DEFAULT_SETTINGS.taxRate,
      updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const getStoredProfile = (): Partial<ProfileResponse> => {
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

export const saveStoredProfile = (profile: Partial<ProfileResponse>) => {
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

  ["accessToken", "token", "refreshToken", PROFILE_STORAGE_KEY].forEach((key) =>
    localStorage.removeItem(key),
  );

  // Clear the HttpOnly cookie by calling the logout endpoint (fire-and-forget)
  fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
};
