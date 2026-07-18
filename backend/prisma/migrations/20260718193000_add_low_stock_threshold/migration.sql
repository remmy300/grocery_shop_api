ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER;

UPDATE "Product"
SET "lowStockThreshold" = 10
WHERE "lowStockThreshold" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "lowStockThreshold" SET DEFAULT 10;
ALTER TABLE "Product" ALTER COLUMN "lowStockThreshold" SET NOT NULL;
