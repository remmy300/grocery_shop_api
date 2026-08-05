import prisma from "./prisma.js";

export type AdminSettings = {
  workspaceName: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  timezone: string;
  language: "en" | "sw";
  lowStockThreshold: number;
  orderAutoCancelHours: number;
  deliveryFee: number;
  supportEmail: string;
  supportPhone: string;
  taxRate: number;
  updatedAt: string;
};

const initialSettings: AdminSettings = {
  workspaceName: "Corner Store",
  defaultCurrency: "KES",
  notificationsEnabled: true,
  timezone: "Africa/Nairobi",
  language: "en",
  lowStockThreshold: 10,
  orderAutoCancelHours: 24,
  deliveryFee: 0,
  supportEmail: "",
  supportPhone: "",
  taxRate: 16,
  updatedAt: new Date().toISOString(),
};

const SETTINGS_ID = 1;

const normalizeLanguage = (language: string): AdminSettings["language"] =>
  language === "sw" ? "sw" : "en";

const toAdminSettings = (settings: {
  workspaceName: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  timezone: string;
  language: string;
  lowStockThreshold: number;
  orderAutoCancelHours: number;
  deliveryFee: number;
  supportEmail: string;
  supportPhone: string;
  taxRate: number;
  updatedAt: Date;
}): AdminSettings => ({
  workspaceName: settings.workspaceName,
  defaultCurrency: settings.defaultCurrency,
  notificationsEnabled: settings.notificationsEnabled,
  timezone: settings.timezone,
  language: normalizeLanguage(settings.language),
  lowStockThreshold: settings.lowStockThreshold,
  orderAutoCancelHours: settings.orderAutoCancelHours,
  deliveryFee: settings.deliveryFee,
  supportEmail: settings.supportEmail,
  supportPhone: settings.supportPhone,
  taxRate: settings.taxRate,
  updatedAt: settings.updatedAt.toISOString(),
});

export const getAdminSettings = async () => {
  const settings = await prisma.adminSetting.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: {
      id: SETTINGS_ID,
      workspaceName: initialSettings.workspaceName,
      defaultCurrency: initialSettings.defaultCurrency,
      notificationsEnabled: initialSettings.notificationsEnabled,
      timezone: initialSettings.timezone,
      language: initialSettings.language,
      lowStockThreshold: initialSettings.lowStockThreshold,
      orderAutoCancelHours: initialSettings.orderAutoCancelHours,
      deliveryFee: initialSettings.deliveryFee,
      supportEmail: initialSettings.supportEmail,
      supportPhone: initialSettings.supportPhone,
      taxRate: initialSettings.taxRate,
    },
  });

  return toAdminSettings(settings);
};

export const updateAdminSettings = async (next: Partial<AdminSettings>) => {
  const {
    workspaceName,
    defaultCurrency,
    notificationsEnabled,
    timezone,
    language,
    lowStockThreshold,
    orderAutoCancelHours,
    deliveryFee,
    supportEmail,
    supportPhone,
    taxRate,
  } = next;

  const settings = await prisma.adminSetting.upsert({
    where: { id: SETTINGS_ID },
    update: {
      ...(workspaceName !== undefined && { workspaceName }),
      ...(defaultCurrency !== undefined && { defaultCurrency }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(timezone !== undefined && { timezone }),
      ...(language !== undefined && { language }),
      ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      ...(orderAutoCancelHours !== undefined && { orderAutoCancelHours }),
      ...(deliveryFee !== undefined && { deliveryFee }),
      ...(supportEmail !== undefined && { supportEmail }),
      ...(supportPhone !== undefined && { supportPhone }),
      ...(taxRate !== undefined && { taxRate }),
      updatedAt: new Date(),
    },
    create: {
      id: SETTINGS_ID,
      workspaceName: workspaceName ?? initialSettings.workspaceName,
      defaultCurrency: defaultCurrency ?? initialSettings.defaultCurrency,
      notificationsEnabled:
        notificationsEnabled ?? initialSettings.notificationsEnabled,
      timezone: timezone ?? initialSettings.timezone,
      language: language ?? initialSettings.language,
      lowStockThreshold:
        lowStockThreshold ?? initialSettings.lowStockThreshold,
      orderAutoCancelHours:
        orderAutoCancelHours ?? initialSettings.orderAutoCancelHours,
      deliveryFee: deliveryFee ?? initialSettings.deliveryFee,
      supportEmail: supportEmail ?? initialSettings.supportEmail,
      supportPhone: supportPhone ?? initialSettings.supportPhone,
      taxRate: taxRate ?? initialSettings.taxRate,
    },
  });

  return toAdminSettings(settings);
};
