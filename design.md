## Backend Overview

### Technology Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT + Google OAuth2
- **Port**: 4000 (default)

---

## Directory Structure

```
backend/src/
├── server.ts              # Express app setup, route mounting
├── controller/            # Business logic handlers
│   ├── productController.ts
│   ├── orderController.ts
│   └── googleAuth.ts
├── routes/                # Route definitions
│   ├── productRoutes.ts
│   ├── orderRoutes.ts
│   └── authRoutes.ts
├── middleware/
│   └── auth.ts            # JWT verification & role authorization
├── lib/
│   └── prisma.ts          # Prisma client instance
├── types/
│   └── express.d.ts       # TypeScript types for Express Request
└── utils/
    ├── token.ts           # JWT generation functions
    └── seed.ts            # Admin user seeding

```

---

## Database Models

| Model         | Fields                                               | Purpose             |
| ------------- | ---------------------------------------------------- | ------------------- |
| **Product**   | id, name, price, stock, imageUrl                     | Grocery items       |
| **Order**     | id, customer, phone, address, lat/lng, total, status | Customer orders     |
| **OrderItem** | id, orderId, productId, price, quantity              | Order line items    |
| **User**      | id, email, password, role                            | Authenticated users |

---

## All Routes

### Public Routes (No Auth Required)

#### Products

- `GET /api/products` — List all products
- `GET /api/products/:id` — Get single product

#### Orders

- `POST /api/orders` — Create new order

#### Auth

- `POST /api/auth/google` — Google OAuth login (body: `{ token: "<google_id_token>" }`)
- `POST /api/auth/refresh` — Refresh access token (body: `{ token: "<refresh_token>" }`)

---

### Protected Routes (JWT Required)

#### Auth (Authenticated User)

- `GET /api/auth/me` — Get current user info
- `GET /api/auth/admins` — Get all admins (admin-only)

#### Products (Admin Only)

- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

#### Orders (Admin Only)

- `GET /api/orders` — List all orders
- `PATCH /api/orders/:id/orderStatus` — Update order status

---

## Authentication Flow

1. User logs in with Google → `POST /api/auth/google`
2. Backend verifies Google token, creates/finds user in DB
3. Returns `accessToken` (15m expiry) + `refreshToken` (1d expiry)
4. Client stores tokens and includes in requests:
   - Header: `Authorization: Bearer <accessToken>`
5. Token expires → `POST /api/auth/refresh` to get new `accessToken`

---

## Key Features Implemented

**Google OAuth2 Integration**
**JWT-based Authentication**
**Role-based Access Control** (Admin vs User)
**Product Management** (CRUD with admin protection)
**Order Management** (Create public, view/update admin-only)
**Admin Seeding**
**CORS Protection**
**Token Refresh Flow**
