import type { Settings } from "@/types";
import { getApiBaseUrl } from "@/lib/api";

const fetchSettingsJson = async <T>(path: string): Promise<T> => {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const fetchServerSettings = async (): Promise<Settings> =>
  fetchSettingsJson<Settings>("/api/settings");
