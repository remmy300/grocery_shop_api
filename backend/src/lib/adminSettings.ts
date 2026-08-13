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
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  deliveryTimeWindow: string;
  deliveryRadiusKm: number;
  mpesaEnabled: boolean;
  codEnabled: boolean;
  allowRegistration: boolean;
  hideOutOfStock: boolean;
  storeTagline: string;
  announcementBanner: string;
  storeOpen: boolean;
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
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  deliveryTimeWindow: string;
  deliveryRadiusKm: number;
  mpesaEnabled: boolean;
  codEnabled: boolean;
  allowRegistration: boolean;
  hideOutOfStock: boolean;
  storeTagline: string;
  announcementBanner: string;
  storeOpen: boolean;
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
  minOrderAmount: settings.minOrderAmount,
  freeDeliveryThreshold: settings.freeDeliveryThreshold,
  deliveryTimeWindow: settings.deliveryTimeWindow,
  deliveryRadiusKm: settings.deliveryRadiusKm,
  mpesaEnabled: settings.mpesaEnabled,
  codEnabled: settings.codEnabled,
  allowRegistration: settings.allowRegistration,
  hideOutOfStock: settings.hideOutOfStock,
  storeTagline: settings.storeTagline,
  announcementBanner: settings.announcementBanner,
  storeOpen: settings.storeOpen,
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
      minOrderAmount: initialSettings.minOrderAmount,
      freeDeliveryThreshold: initialSettings.freeDeliveryThreshold,
      deliveryTimeWindow: initialSettings.deliveryTimeWindow,
      deliveryRadiusKm: initialSettings.deliveryRadiusKm,
      mpesaEnabled: initialSettings.mpesaEnabled,
      codEnabled: initialSettings.codEnabled,
      allowRegistration: initialSettings.allowRegistration,
      hideOutOfStock: initialSettings.hideOutOfStock,
      storeTagline: initialSettings.storeTagline,
      announcementBanner: initialSettings.announcementBanner,
      storeOpen: initialSettings.storeOpen,
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
    minOrderAmount,
    freeDeliveryThreshold,
    deliveryTimeWindow,
    deliveryRadiusKm,
    mpesaEnabled,
    codEnabled,
    allowRegistration,
    hideOutOfStock,
    storeTagline,
    announcementBanner,
    storeOpen,
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
      ...(minOrderAmount !== undefined && { minOrderAmount }),
      ...(freeDeliveryThreshold !== undefined && { freeDeliveryThreshold }),
      ...(deliveryTimeWindow !== undefined && { deliveryTimeWindow }),
      ...(deliveryRadiusKm !== undefined && { deliveryRadiusKm }),
      ...(mpesaEnabled !== undefined && { mpesaEnabled }),
      ...(codEnabled !== undefined && { codEnabled }),
      ...(allowRegistration !== undefined && { allowRegistration }),
      ...(hideOutOfStock !== undefined && { hideOutOfStock }),
      ...(storeTagline !== undefined && { storeTagline }),
      ...(announcementBanner !== undefined && { announcementBanner }),
      ...(storeOpen !== undefined && { storeOpen }),
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
      minOrderAmount: minOrderAmount ?? initialSettings.minOrderAmount,
      freeDeliveryThreshold:
        freeDeliveryThreshold ?? initialSettings.freeDeliveryThreshold,
      deliveryTimeWindow:
        deliveryTimeWindow ?? initialSettings.deliveryTimeWindow,
      deliveryRadiusKm: deliveryRadiusKm ?? initialSettings.deliveryRadiusKm,
      mpesaEnabled: mpesaEnabled ?? initialSettings.mpesaEnabled,
      codEnabled: codEnabled ?? initialSettings.codEnabled,
      allowRegistration: allowRegistration ?? initialSettings.allowRegistration,
      hideOutOfStock: hideOutOfStock ?? initialSettings.hideOutOfStock,
      storeTagline: storeTagline ?? initialSettings.storeTagline,
      announcementBanner:
        announcementBanner ?? initialSettings.announcementBanner,
      storeOpen: storeOpen ?? initialSettings.storeOpen,
    },
  });

  return toAdminSettings(settings);
};
