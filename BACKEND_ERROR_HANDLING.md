# Backend API & Error Handling Guide

## Backend Architecture Overview

```
backend/
├── src/
│   ├── server.ts (entry point)
│   ├── controller/
│   │   ├── adminController.ts (dashboard data)
│   │   ├── orderController.ts (orders)
│   │   ├── productController.ts (products)
│   │   └── googleAuth.ts (authentication)
│   ├── middleware/
│   │   └── auth.ts (JWT verification)
│   ├── routes/
│   │   ├── adminRoutes.ts (protected)
│   │   ├── orderRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── authRoutes.ts
│   ├── lib/
│   │   ├── prisma.ts (database)
│   │   ├── adminSettings.ts
│   │   └── token.ts
│   ├── utils/
│   │   ├── seed.ts
│   │   └── token.ts
│   └── types/
│       ├── bcrypt.d.ts
│       ├── express.d.ts
│       └── index.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## Error Handling Improvements

### 1. Global Error Handler (NEW)

**Location**: backend/src/server.ts

**What it does**:

```typescript
app.use((err: any, req, res, _next) => {
  console.error("Error caught by global handler:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production" ? "An error occurred" : message,
  });
});
```

**Catches**:

- Unhandled exceptions
- Controller errors
- Database errors
- Validation errors

**Returns**:

- Production: Generic message
- Development: Detailed error message

---

### 2. 404 Handler (NEW)

**Location**: backend/src/server.ts

**What it does**:

```typescript
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});
```

**Returns**: Proper 404 instead of generic HTML

---

### 3. Improved Auth Middleware (ENHANCED)

**Location**: backend/src/middleware/auth.ts

**What Changed**:

- More specific error messages
- Distinguishes between different failure modes
- Includes error codes for debugging
- Validates JWT secret exists

**Error Types**:

```
NO_TOKEN - Authorization header missing
INVALID_AUTH_FORMAT - Bearer token format wrong
TOKEN_EXPIRED - JWT has expired
INVALID_TOKEN - JWT validation failed
NO_USER_CONTEXT - User not found in context
INSUFFICIENT_PERMISSIONS - User role doesn't match
AUTH_CONFIG_ERROR - Server misconfiguration
```

**Example Error Response**:

```json
{
  "message": "Token expired",
  "error": "TOKEN_EXPIRED"
}
```

---

### 4. Database Connection Handling (ENHANCED)

**Location**: backend/src/lib/prisma.ts

**What Changed**:

- Validates database connection on startup
- Better error logging
- Graceful shutdown handling
- Process exit code properly set

**Startup Messages**:

```
 If connection OK: Silent (no error)
If connection fails:
 Database connection failed: ...
 Check DATABASE_URL in .env: postgresql://...
   Process exits with code 1
```

**Shutdown Handling**:

```
Gracefully closes database when:
- SIGTERM signal received
- Process terminated
```

---

## API Endpoints & Error Handling

### Admin Routes (Protected)

All require `Authorization: Bearer <token>` header and `admin` role

| Endpoint                    | Method | Error Status  | Common Errors                                     |
| --------------------------- | ------ | ------------- | ------------------------------------------------- |
| /api/admin/dashboard        | GET    | 401, 403, 500 | Token invalid, Insufficient permissions, DB error |
| /api/admin/inventory        | GET    | 401, 403, 500 | Same as above                                     |
| /api/admin/orders           | GET    | 401, 403, 500 | Same as above                                     |
| /api/admin/users            | GET    | 401, 403, 500 | Same as above                                     |
| /api/admin/analytics        | GET    | 401, 403, 500 | Same as above                                     |
| /api/admin/profile          | GET    | 401, 500      | Token invalid, DB error                           |
| /api/admin/profile          | PATCH  | 400, 401, 500 | Invalid input, Token invalid, DB error            |
| /api/admin/profile/password | PATCH  | 400, 401, 500 | Invalid input, Token invalid, DB error            |
| /api/admin/settings         | GET    | 401, 500      | Token invalid, DB error                           |
| /api/admin/settings         | PUT    | 400, 401, 500 | Invalid input, Token invalid, DB error            |

### Auth Routes (Public)

| Endpoint          | Method | Status        | Response                      |
| ----------------- | ------ | ------------- | ----------------------------- |
| /api/auth/google  | POST   | 200, 400, 401 | { accessToken, refreshToken } |
| /api/auth/refresh | POST   | 200, 400, 500 | { accessToken }               |
| /api/auth/me      | GET    | 200, 401      | Current user info             |
| /api/auth/admins  | GET    | 200           | List of admin users           |

### Product Routes (Public)

| Endpoint          | Method | Status             | Response        |
| ----------------- | ------ | ------------------ | --------------- |
| /api/products     | GET    | 200, 500           | Product array   |
| /api/products     | POST   | 201, 400, 500      | Created product |
| /api/products/:id | GET    | 200, 404, 500      | Product details |
| /api/products/:id | PATCH  | 200, 400, 404, 500 | Updated product |
| /api/products/:id | DELETE | 200, 404, 500      | Success message |

### Order Routes (Public)

| Endpoint        | Method | Status        | Response      |
| --------------- | ------ | ------------- | ------------- |
| /api/orders     | GET    | 200, 500      | Orders array  |
| /api/orders     | POST   | 201, 400, 500 | Created order |
| /api/orders/:id | GET    | 200, 404, 500 | Order details |

---

## Common Error Scenarios

### Scenario 1: "Request failed with status 500"

**Frontend**: Shows error to user

**Backend**: Check console for one of these:

```
1. "Database connection failed"
   → DATABASE_URL is wrong or database not running

2. "Error caught by global handler"
   → Unhandled exception in controller
   → Look at the actual error message below it

3. No error in console at all
   → Check if backend is running
   → Check if port 4000 is accessible
```

**Fix Checklist**:

```
□ Backend running: ps aux | grep node
□ Database running: psql connection works
□ DATABASE_URL correct in backend/.env
□ Port 4000 not blocked
□ CORS configured correctly
□ Auth token valid
```

---

### Scenario 2: "No token provided" (401)

**Cause**: Missing Authorization header

**Why it happens**:

- User not logged in
- Token not saved to localStorage
- Token cleared from storage

**Fix**:

1. Trigger login flow (Google OAuth)
2. Wait for tokens to be saved
3. Try request again

---

### Scenario 3: "Token expired" (401)

**Cause**: JWT token lifetime exceeded

**JWT Config**:

```
JWT_ACCESS_TOKEN_EXPIRY=15m (short-lived)
JWT_REFRESH_TOKEN_EXPIRY=1d (long-lived)
```

**Fix**:

1. Use refreshToken to get new accessToken
2. Or user must login again

---

### Scenario 4: "Forbidden" (403)

**Cause**: User role insufficient

**Example**:

- User tries to access /api/admin/\* with role="user"
- Requires role="admin"

**Fix**:

1. Login with admin account
2. Check ADMIN_EMAILS in backend/.env
3. Verify user role in database

---

### Scenario 5: "Invalid Google token" (401)

**Cause**: Google OAuth token validation failed

**Why**:

- GOOGLE_CLIENT_ID is wrong
- Token expired
- Token from wrong client ID

**Fix**:

```
1. Verify GOOGLE_CLIENT_ID matches:
   - Google Cloud Console
   - backend/.env
   - frontend/.env

2. Check token is fresh (just received)

3. Verify frontend sending token correctly
```

---

## JWT Token Management

### Tokens Generated by Backend

**Access Token** (Short-lived):

```
Expiry: 15 minutes
Use: API request Authorization header
Secret: JWT_ACCESS_SECRET
Payload: { id, email, role, picture }
```

**Refresh Token** (Long-lived):

```
Expiry: 1 day
Use: Get new access token when expired
Secret: JWT_REFRESH_TOKEN
Payload: { id, email, role }
```

### Token Flow

```
1. User logs in with Google
   ↓
2. Backend validates Google token
   ↓
3. Backend creates/finds user in DB
   ↓
4. Backend generates Access + Refresh tokens
   ↓
5. Frontend saves both tokens
   ↓
6. Frontend sends accessToken in requests
   ↓
7. When access token expires (15m):
   a. Backend returns 401
   b. Frontend uses refresh token
   c. Get new access token
   d. Retry request
```

---

## Database Schema Review

### Product Table

```sql
id: Int (auto-increment)
name: String (required)
price: Int (in cents)
stock: Int
imageUrl: String? (nullable)
```

**Error Prone Fields**:

- Now: Proper type validation in controller
- Now: parseInteger() validates numbers
- Now: Truncates/validates strings

### Order Table

```sql
id: Int (auto-increment)
customer: String (required)
phone: String (required)
address: String (required)
latitude: Float? (nullable)
longitude: Float? (nullable)
total: Int (calculated from items)
orderStatus: String (default: "pending")
items: OrderItem[] (relationship)
createdAt: DateTime (auto)
```

**Error Prone Fields**:

- Now: Validates all required fields
- Now: Validates item structure
- Now: Calculates total from prices

### User Table

```sql
id: Int (auto-increment)
email: String (unique)
password: String
role: String (default: "Admin")
picture: String? (nullable)
createdAt: DateTime (auto)
```

**Error Prone Fields**:

- Now: Validates email uniqueness
- Now: Role gets set based on ADMIN_EMAILS

---

## Production Checklist

### Environment Variables

```
□ NODE_ENV=production
□ FRONTEND_URL verified (no localhost)
□ DATABASE_URL points to production DB
□ All JWT secrets are strong (>32 chars)
□ GOOGLE_CLIENT_ID updated for production
□ ADMIN_EMAILS configured
```

### Security

```
□ Error messages don't leak sensitive info
□ CORS restricted to specific origin
□ Password hashing enabled (bcrypt)
□ JWT secrets are random & strong
□ No console.log() with secrets
```

### Performance

```
□ Database indexes created
□ Connection pooling configured
□ Request logging at appropriate level
□ Monitoring/alerting set up
```

### Reliability

```
□ Error handling catches all scenarios
□ Graceful shutdown on SIGTERM
□ Database connection recovery
□ Request timeout configured
```

---

## Related Files

- [Frontend Error Handling](./ERROR_500_FIX.md)
- [Next.js Configuration](./NEXTJS_CONFIG_REVIEW.md)
- [Design System](./design.md)
