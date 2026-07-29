import { ProfileResponse, Settings } from "@/types";
import { displayNameFromEmail, initialsFrom } from "@/utils/formatters";
import { getStoredProfile, getStoredSettings } from "./storage.services";

const DEMO_PROFILE: ProfileResponse = {
  id: 1,
  email: "jenta@admin.com",
  role: "admin",
  displayName: "Jenta",
  initials: "J",
  joinedOn: "Current session",
};

const SETTINGS_STORAGE_KEY = "corner-store-admin-settings";

export const mergeProfile = (
  profile: Partial<ProfileResponse>,
): ProfileResponse => {
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

export const getSyntheticProfile = () => mergeProfile(getStoredProfile());

export const saveSettings = (settings: Partial<Settings>) => {
  if (typeof window === "undefined") {
    return getStoredSettings();
  }

  const nextSettings: Settings = {
    ...getStoredSettings(),
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  return nextSettings;
};
