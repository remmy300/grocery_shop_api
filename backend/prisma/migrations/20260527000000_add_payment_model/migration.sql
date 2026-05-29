-- CreatePaymentTable
-- Add paymentStatus and paymentMethod to Order
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'mpesa';

-- Update total field to Float
ALTER TABLE "Order" ALTER COLUMN "total" TYPE REAL;

-- Create Payment table
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "orderId" INTEGER NOT NULL UNIQUE,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paymentMethod" TEXT NOT NULL DEFAULT 'mpesa',
    
    -- M-Pesa specific fields
    "merchantRequestId" TEXT,
    "checkoutRequestId" TEXT UNIQUE,
    "responseCode" TEXT,
    "responseDescription" TEXT,
    "customerMessage" TEXT,
    
    -- Payment tracking
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mpesaReceiptNumber" TEXT,
    "resultCode" TEXT,
    "resultDescription" TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE
);

-- Create index on checkoutRequestId for faster lookups
CREATE INDEX "Payment_checkoutRequestId_idx" ON "Payment"("checkoutRequestId");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
