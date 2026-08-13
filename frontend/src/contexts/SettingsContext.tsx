"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchJson } from "@/lib/api";
import type { Settings } from "@/types";
import { getStoredSettings } from "@/services/storage.services";

const SETTINGS_STORAGE_KEY = "corner-store-admin-settings";

const DEFAULT_SETTINGS: Settings = {
  workspaceName: "Corner Shop",
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
  minOrderAmount: 0,
  freeDeliveryThreshold: 0,
  deliveryTimeWindow: "",
  deliveryRadiusKm: 20,
  mpesaEnabled: true,
  codEnabled: true,
  allowRegistration: true,
  hideOutOfStock: false,
  storeTagline: "",
  announcementBanner: "",
  storeOpen: true,
  updatedAt: "",
};

type SettingsContextValue = {
  settings: Settings;
  isLoading: boolean;
  refresh: () => Promise<void>;
  applySettings: (settings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Start with static defaults so the server render and first client render
  // always match (no hydration mismatch). Cache + server values are applied
  // in an effect after mount.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  const persist = (next: Settings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage may be unavailable in private browsing
    }
  };

  const refresh = useCallback(async () => {
    try {
      const next = await fetchJson<Settings>("/api/settings");
      setSettings(next);
      persist(next);
    } catch {
      // Keep the cached/default values when the backend is unreachable.
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applySettings = useCallback((next: Settings) => {
    setSettings(next);
    persist(next);
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    // Paint cached settings immediately, then reconcile with the server.
    setSettings(getStoredSettings());
    void refresh();
  }, [refresh]);

  // Pick up changes made in another tab (admin saves while the store is open).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) void refresh();
    };
    const onFocus = () => void refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, refresh, applySettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
