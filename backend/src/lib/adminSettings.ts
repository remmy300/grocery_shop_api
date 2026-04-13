export type AdminSettings = {
  workspaceName: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  updatedAt: string;
};

// Lightweight in-memory admin settings store.
// This keeps the admin APIs working without a dedicated Prisma model, but the
// values reset when the backend process restarts.
const initialSettings: AdminSettings = {
  workspaceName: "Corner Store",
  defaultCurrency: "USD",
  notificationsEnabled: true,
  updatedAt: new Date().toISOString(),
};

let currentSettings = { ...initialSettings };

export const getAdminSettings = () => ({ ...currentSettings });

export const updateAdminSettings = (next: Partial<AdminSettings>) => {
  currentSettings = {
    ...currentSettings,
    ...next,
    updatedAt: new Date().toISOString(),
  };

  return { ...currentSettings };
};
