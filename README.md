# Corner Shop

A full-stack online grocery store with an admin dashboard, M-Pesa payments, and customer-facing storefront.

---

## Tech Stack

| Layer      | Technologies                                                 |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Next.js 14, React 18, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend    | Express.js, Node.js, TypeScript, Prisma 7                    |
| Database   | PostgreSQL (Neon)                                            |
| Auth       | Google OAuth 2.0, JWT (httpOnly cookies)                     |
| Payments   | M-Pesa Daraja API (STK Push)                                 |
| Storage    | Cloudinary (product images)                                  |
| Deployment | Render (backend), Vercel (frontend)                          |

---

## Features

### Storefront

- Product catalogue with category filtering and search
- Shopping cart (guest + authenticated)
- M-Pesa STK Push checkout
- Order tracking
- Responsive design — mobile first

### Admin Dashboard

- Inventory management (create, update, delete products with unit pricing)
- Order management with status updates and CSV export
- User management and role assignment
- Analytics — revenue charts, top products, category breakdown
- Recent activity feed
- Cloudinary image uploads

---

## Project Structure

```
grocery_shop/
├── backend/
│   ├── src/
│   │   ├── controller/     # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, rate limiting, IP whitelist
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── lib/            # Prisma client, utilities
│   │   └── utils/          # M-Pesa service, token helpers
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # Shared UI components
        ├── features/       # Navbar, Footer
        ├── hooks/          # Custom React hooks
        ├── contexts/       # AppContext (auth state)
        └── lib/            # API client, product helpers
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- Google OAuth credentials
- Safaricom Daraja API credentials

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Docker (both services at once)

```bash
docker compose up --build
```

---

## Environment Variables

### Backend `backend/.env`

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET_KEY=
JWT_ACCESS_SECRET=
JWT_REFRESH_TOKEN=
GOOGLE_CLIENT_ID=
ADMIN_EMAILS=admin@example.com
FRONTEND_URL=http://localhost:3000
PORT=4000

# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORT_CODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-backend.com/api/payments/callback
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend `frontend/.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## API Overview

| Method | Path                          | Auth          | Description           |
| ------ | ----------------------------- | ------------- | --------------------- |
| POST   | `/api/auth/google`            | —             | Google OAuth login    |
| GET    | `/api/auth/me`                | JWT           | Current user          |
| GET    | `/api/products`               | —             | List products         |
| POST   | `/api/products`               | Admin         | Create product        |
| PUT    | `/api/products/:id`           | Admin         | Update product        |
| POST   | `/api/orders`                 | JWT           | Create order          |
| GET    | `/api/orders/my`              | JWT           | My orders             |
| PATCH  | `/api/orders/:id/orderStatus` | Admin         | Update status         |
| POST   | `/api/payments/initiate`      | JWT           | Start M-Pesa STK push |
| POST   | `/api/payments/callback`      | Safaricom IPs | M-Pesa webhook        |
| GET    | `/api/admin/dashboard`        | Admin         | Dashboard stats       |
| GET    | `/api/admin/analytics`        | Admin         | Analytics data        |

---

## Security

- JWT stored in **httpOnly cookies**
- All admin routes protected with `auth + authorizeRoles("admin")`
- **Zod validation** on every mutation endpoint
- **Safaricom IP whitelist** on M-Pesa callback route
- Rate limiting on auth (10/15 min), payments (10/min), and cart (60/min)
- `helmet` security headers enabled in production
- CORS restricted to configured frontend origin(s)

---

## Deployment

### Render (backend)

Build command:

```bash
npm install && npx prisma migrate deploy && npm run build
```

Start command:

```bash
npm start
```

### Vercel (frontend)

Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL in the Vercel project settings.

---

## License

MIT
