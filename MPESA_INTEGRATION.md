# M-Pesa Payment Integration Guide

## Overview

This guide covers the complete M-Pesa payment integration for the Grocery Shop application using Safaricom's Daraja API.

## Architecture

### Payment Flow

1. **Order Creation** → Customer creates order with delivery details
2. **STK Push** → Backend initiates M-Pesa STK Push to customer's phone
3. **Customer Enters PIN** → Customer enters M-Pesa PIN on their phone
4. **Callback** → M-Pesa sends callback confirming payment
5. **Order Confirmation** → System updates order status to confirmed

### Components

- **Backend**: Express.js + Node.js
- **Frontend**: Next.js/React
- **Database**: PostgreSQL with Prisma ORM
- **Payment API**: Safaricom Daraja API (STK Push)

## Setup Instructions

### 1. Get M-Pesa Credentials

To integrate M-Pesa, you need:

1. **Consumer Key & Secret** - From [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
   - Go to "My Apps" → Create an app
   - Copy Consumer Key and Consumer Secret

2. **Business Shortcode** - Your M-Pesa business till number
   - For sandbox: `174379`
   - For production: Your actual till number

3. **Passkey** - Lipa Na M-Pesa Online Passkey
   - For sandbox: `bfb279f9aa9bdbcf158e97dd1a503b6e78bc6ffb7efb2e4c9d2e8c8e8c8c8c8c`
   - For production: Get from Safaricom

4. **Callback URL** - Your server's payment callback endpoint
   - Must be publicly accessible
   - Example: `https://your-domain.com/api/payments/callback`

### 2. Environment Setup

#### Backend (.env)

```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORT_CODE=174379  # or your production shortcode
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a503b6e78bc6ffb7efb2e4c9d2e8c8e8c8c8c8c  # sandbox passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/callback
MPESA_ENVIRONMENT=sandbox  # or 'production'

# Other configs
DATABASE_URL=your_database_url
FRONTEND_URL=http://localhost:3000
PORT=4000
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 3. Database Migration

Run the Prisma migration to create the Payment table:

```bash
cd backend
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

This creates:

- `Payment` table to track all payment transactions
- Relationship between `Order` and `Payment`
- Adds `paymentStatus` and `paymentMethod` fields to `Order`

### 4. Install Dependencies

Ensure M-Pesa service has axios for API calls:

```bash
cd backend
npm install axios
```

## API Endpoints

### Initiate Payment

**Endpoint**: `POST /api/payments/initiate`

**Request**:

```json
{
  "orderId": 123,
  "phoneNumber": "254701234567",
  "amount": 1500.5
}
```

**Phone Number Formats**:

- International: `254XXXXXXXXX`
- Local: `0XXXXXXXXX` (automatically converted)

**Response**:

```json
{
  "message": "M-Pesa STK Push initiated",
  "checkoutRequestId": "ws_CO_DMZ_xxx",
  "merchantRequestId": "16813-1590513-1",
  "customerMessage": "Please enter your M-Pesa PIN to complete this transaction.",
  "payment": {
    "id": 456,
    "status": "pending"
  }
}
```

### Payment Callback

**Endpoint**: `POST /api/payments/callback`

This is called by M-Pesa after payment. No action needed from you - it's automatic.

### Query Payment Status

**Endpoint**: `GET /api/payments/status?orderId=123`

**Response**:

```json
{
  "payment": {
    "id": 456,
    "status": "completed|pending|failed",
    "mpesaReceiptNumber": "LIK12345ABC",
    "resultCode": "0",
    "resultDescription": "The service request has been processed successfully."
  },
  "status": "completed"
}
```

### Get Payment Details

**Endpoint**: `GET /api/payments/:orderId`

Requires authentication.

## Frontend Integration

### MpesaPaymentProcessor Component

Used in checkout to handle the payment flow:

```tsx
import MpesaPaymentProcessor from "@/components/checkout/MpesaPaymentProcessor";

<MpesaPaymentProcessor
  orderId={123}
  amount={1500.5}
  phoneNumber="254701234567"
  customerName="John Doe"
  onSuccess={(receipt) => console.log("Payment successful:", receipt)}
  onError={(error) => console.log("Payment failed:", error)}
/>;
```

### useMpesaPayment Hook

For custom payment handling:

```tsx
import { useMpesaPayment } from "@/hooks/useMpesaPayment";

const {
  initiate, // Mutation to initiate payment
  status, // Query for payment status
  isPaymentCompleted, // Boolean flag
  isPaymentFailed, // Boolean flag
  startPolling, // Start status polling
  stopPolling, // Stop status polling
} = useMpesaPayment();

// Initiate payment
await initiate.mutateAsync({
  orderId: 123,
  phoneNumber: "254701234567",
  amount: 1500.5,
});

// Poll for completion (every 3 seconds)
startPolling(3000);
```

## Testing

### Sandbox Testing

1. Use Safaricom's test credentials (provided in setup)
2. Use test phone number: `254708374149`
3. Test M-Pesa PIN: `123456`

### Test Scenarios

| Scenario           | Phone Number | Result     |
| ------------------ | ------------ | ---------- |
| Successful Payment | 254708374149 | Successful |
| Insufficient Funds | 254708374150 | Failed     |
| Cancelled by User  | 254708374151 | Cancelled  |

### curl Example

```bash
curl -X POST http://localhost:4000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "phoneNumber": "254701234567",
    "amount": 1500
  }'
```

## Production Deployment

### Before Going Live

1. **Get Production Credentials**
   - Contact Safaricom Daraja support
   - Request production credentials
   - Update your shortcode and passkey

2. **Update Environment**

   ```bash
   MPESA_ENVIRONMENT=production
   MPESA_SHORT_CODE=your_production_shortcode
   MPESA_PASSKEY=your_production_passkey
   MPESA_CALLBACK_URL=https://your-production-domain.com/api/payments/callback
   ```

3. **SSL Certificate**
   - Ensure your callback URL uses HTTPS
   - Get valid SSL certificate (e.g., from Let's Encrypt)

4. **Test End-to-End**
   - Test payment flow with production credentials
   - Verify callback handling
   - Check order status updates

5. **Monitor**
   - Log all payment transactions
   - Set up alerts for failed payments
   - Monitor callback delivery

## Troubleshooting

### Common Issues

#### "Failed to get M-Pesa access token"

- Verify Consumer Key and Secret
- Check if API credentials are enabled
- Ensure you're using correct environment (sandbox/production)

#### "Payment callback not received"

- Verify callback URL is publicly accessible
- Check firewall rules
- Ensure HTTPS is properly configured
- Check logs for callback errors

#### "Order not found for callback"

- Verify checkoutRequestId is stored correctly
- Check database connection
- Verify Payment record creation

#### "Phone number format invalid"

- Use format: `254XXXXXXXXX` (international)
- Or: `0XXXXXXXXX` (local - auto-converted)
- Ensure 10-12 digits after country/area code

### Debug Logs

Enable logging to troubleshoot:

```typescript
// In paymentController.ts
console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));
console.log("Payment updated:", updatedPayment);
```

## Security Best Practices

1. **Environment Variables**
   - Never commit credentials to version control
   - Use strong, unique credentials
   - Rotate credentials regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Validate SSL certificates

3. **Validation**
   - Validate phone numbers before API calls
   - Verify callback signatures (when available)
   - Check order amount matches payment

4. **Rate Limiting**
   - Implement rate limiting on payment endpoints
   - Prevent duplicate payment attempts

5. **Logging**
   - Log all payment transactions
   - Never log sensitive data (PINs, etc.)
   - Keep logs for audit trail

## File Structure

```
backend/
├── src/
│   ├── controller/
│   │   ├── paymentController.ts    # Payment handlers
│   │   └── orderController.ts      # Updated for payment
│   ├── routes/
│   │   ├── paymentRoutes.ts        # Payment endpoints
│   │   └── orderRoutes.ts          # Updated routes
│   ├── utils/
│   │   └── mpesaService.ts         # M-Pesa API service
│   └── server.ts                   # Updated with payment routes
├── prisma/
│   └── schema.prisma               # Updated schema

frontend/
├── src/
│   ├── components/
│   │   └── checkout/
│   │       ├── MpesaPaymentProcessor.tsx  # Payment component
│   │       ├── checkoutContext.tsx        # Updated context
│   │       └── checkoutProvider.tsx
│   ├── hooks/
│   │   └── useMpesaPayment.ts            # Payment hook
│   └── app/
│       └── checkout/
│           └── page.tsx                  # Updated checkout
```

## API Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 0    | Success                              |
| 1    | Insufficient Funds                   |
| 2    | Less Than Minimum Transaction Amount |
| 3    | More Than Maximum Transaction Amount |
| 4    | Invalid Account Number               |
| 5    | Account Locked                       |
| 6    | Transaction Timeout                  |
| 14   | Invalid Phone Number                 |
| 17   | Invalid Short Code                   |
| 20   | Invalid Date Format                  |
| 21   | Invalid Command ID                   |
| 22   | Invalid Timestamp                    |
| 23   | Invalid Checksum                     |
| 24   | Invalid Access Token                 |
| 25   | Invalid OAuth Credentials            |

## Support & Resources

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/mpesa-api)
- [Daraja API Sandbox](https://sandbox.safaricom.co.ke/)
- [M-Pesa Payment Flows](https://developer.safaricom.co.ke/docs)

## Next Steps

1. ✅ Get M-Pesa credentials from Safaricom
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Test in sandbox environment
5. ✅ Deploy to production
6. ✅ Monitor payment transactions

---

**Last Updated**: May 2026
**Version**: 1.0.0
