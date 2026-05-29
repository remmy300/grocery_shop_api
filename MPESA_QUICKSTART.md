# M-Pesa Quick Start Guide

## 5-Minute Setup

### Step 1: Get Credentials (2 mins)

1. Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Sign up for a developer account
3. Create an app
4. Copy your **Consumer Key** and **Consumer Secret**
5. Use sandbox credentials:
   - **Short Code**: `174379`
   - **Passkey**: `bfb279f9aa9bdbcf158e97dd1a503b6e78bc6ffb7efb2e4c9d2e8c8e8c8c8c8c`

### Step 2: Update Environment (2 mins)

Create/update `.env` in `backend/`:

```bash
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a503b6e78bc6ffb7efb2e4c9d2e8c8e8c8c8c8c
MPESA_CALLBACK_URL=http://localhost:4000/api/payments/callback
MPESA_ENVIRONMENT=sandbox
FRONTEND_URL=http://localhost:3000
```

### Step 3: Database Setup (1 min)

```bash
cd backend
npx prisma migrate dev --name add_payment_model
```

### Step 4: Test Payment

1. Go to checkout
2. Select M-Pesa
3. Use test number: **254708374149**
4. Enter PIN: **123456**
5. Payment should complete!

## Testing Phone Numbers

| Number       | Result                |
| ------------ | --------------------- |
| 254708374149 | ✅ Success            |
| 254708374150 | ❌ Insufficient Funds |
| 254708374151 | ⏸️ Timeout            |

## Troubleshooting

### Payment not working?

1. **Check credentials**

   ```bash
   echo $MPESA_CONSUMER_KEY
   ```

2. **Check database migration**

   ```bash
   npx prisma db push
   ```

3. **Check logs**

   ```bash
   # Terminal with running backend
   npm run dev
   # Look for M-Pesa API responses
   ```

4. **Test API directly**
   ```bash
   curl -X POST http://localhost:4000/api/payments/initiate \
     -H "Content-Type: application/json" \
     -d '{
       "orderId": 1,
       "phoneNumber": "254708374149",
       "amount": 100
     }'
   ```

## Architecture

```
Customer → Frontend → Backend → M-Pesa API
   ↓                    ↓
   └─ Create Order ─────┤
   ↓                    ↓
   ├─ Enter PIN ──→ Initiate STK Push
   ↓                    ↓
   └─ Confirm ─────→ Process Payment
                        ↓
                    Callback Handler
                        ↓
                    Update Order Status
```

## Files Added

- ✅ `backend/src/utils/mpesaService.ts` - M-Pesa API client
- ✅ `backend/src/controller/paymentController.ts` - Payment handlers
- ✅ `backend/src/routes/paymentRoutes.ts` - Payment endpoints
- ✅ `frontend/src/hooks/useMpesaPayment.ts` - React hook
- ✅ `frontend/src/components/checkout/MpesaPaymentProcessor.tsx` - UI component
- ✅ `backend/prisma/schema.prisma` - Updated with Payment model
- ✅ `backend/prisma/migrations/...` - Database migration

## Database Changes

### New Payment Table

```sql
Payment {
  id, orderId, amount, currency
  status, merchantRequestId, checkoutRequestId
  mpesaReceiptNumber, resultCode
  createdAt, updatedAt, completedAt
}
```

### Updated Order Table

```sql
Order {
  ... existing fields ...
  paymentStatus (pending/completed/failed)
  paymentMethod (mpesa/card/cod)
}
```

## API Endpoints

| Method | Endpoint                 | Purpose        |
| ------ | ------------------------ | -------------- |
| POST   | `/api/payments/initiate` | Start payment  |
| POST   | `/api/payments/callback` | M-Pesa webhook |
| GET    | `/api/payments/status`   | Check status   |
| GET    | `/api/payments/:orderId` | Get details    |

## Payment Flow

1. **User clicks "Create Order"**
   - Order created with `paymentStatus: "pending"`

2. **M-Pesa component initiates STK Push**
   - Calls `/api/payments/initiate`
   - M-Pesa prompt sent to phone

3. **User enters PIN**
   - PIN entered on phone
   - M-Pesa processes payment

4. **M-Pesa sends callback**
   - Backend receives callback
   - Updates Payment record
   - Updates Order status

5. **Frontend detects completion**
   - Shows success message
   - Order confirmed

## Common Errors

| Error                    | Solution                       |
| ------------------------ | ------------------------------ |
| "Failed to authenticate" | Check Consumer Key/Secret      |
| "Invalid phone number"   | Use format: 254XXXXXXXXX       |
| "Insufficient funds"     | Use test number 254708374149   |
| "Callback not received"  | Ensure callback URL is correct |

## Next: Production Deployment

When ready for production:

1. Get production credentials from Safaricom
2. Update `.env` with production values
3. Set `MPESA_ENVIRONMENT=production`
4. Deploy to production server
5. Test with real transactions

---

**Need help?** Check [MPESA_INTEGRATION.md](./MPESA_INTEGRATION.md) for detailed docs.
