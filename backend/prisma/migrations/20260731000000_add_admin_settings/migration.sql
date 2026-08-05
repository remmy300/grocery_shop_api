CREATE TABLE "AdminSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "workspaceName" TEXT NOT NULL DEFAULT 'Corner Store',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'KES',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
    "language" TEXT NOT NULL DEFAULT 'en',
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "orderAutoCancelHours" INTEGER NOT NULL DEFAULT 24,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "supportPhone" TEXT NOT NULL DEFAULT '',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 16,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AdminSetting" (
    "id",
    "workspaceName",
    "defaultCurrency",
    "notificationsEnabled",
    "timezone",
    "language",
    "lowStockThreshold",
    "orderAutoCancelHours",
    "deliveryFee",
    "supportEmail",
    "supportPhone",
    "taxRate",
    "updatedAt"
) VALUES (
    1,
    'Corner Store',
    'KES',
    true,
    'Africa/Nairobi',
    'en',
    10,
    24,
    0,
    '',
    '',
    16,
    CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;
