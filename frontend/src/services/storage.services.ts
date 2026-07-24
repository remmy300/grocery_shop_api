import { SettingsResponse, ProfileResponse } from "@/types";
import { getApiBaseUrl } from "@/lib/api";

const SETTINGS_STORAGE_KEY = "corner-store-admin-settings";
const PROFILE_STORAGE_KEY = "corner-store-profile";

export const getStoredSettings = (): SettingsResponse => {
  if (typeof window === "undefined") {
    return {
      workspaceName: "Corner Store",
      defaultCurrency: "KES",
      notificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  }

  const fallback: SettingsResponse = {
    workspaceName: "Corner Store",
    defaultCurrency: "KES",
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
