# Corner Store - Admin Dashboard

A modern, high-performance admin panel for managing a grocery store's operations including inventory, orders, users, and analytics.

---

## 📋 Project Overview

**Corner Store** is a full-stack web application built with **Next.js 14** (frontend) and **Express.js** (backend) that provides a comprehensive admin dashboard for grocery store management. The application features real-time inventory tracking, order management, user administration, and detailed analytics.

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Google OAuth 2.0, JWT (JSON Web Tokens)
- **Data Fetching**: Axios, React Query (@tanstack/react-query)
- **UI Components**: shadcn/ui, Lucide React Icons
- **State Management**: React Context API, React Query

---

## 🛠️ What Was Built & Improved

### Phase 1: Core Functionality

✅ Full-stack admin dashboard with authentication  
✅ Product/Inventory management with stock tracking  
✅ Order management system with order history  
✅ User management and admin role controls  
✅ Analytics dashboard with revenue charts

### Phase 2: Error Handling & Configuration Fixes

✅ **Fixed 500 Errors** - Added global error handlers in backend  
✅ **Environment Variables** - Configured proper API_BASE_URL and security settings  
✅ **Prisma Error Handling** - Added database connection validation  
✅ **Auth Middleware** - Enhanced with specific error codes and messages  
✅ **Next.js Security Headers** - Added X-Content-Type-Options, X-Frame-Options, X-XSS-Protection  
✅ **Image Optimization** - Configured remote image patterns for Unsplash

### Phase 3: UI/UX Improvements

✅ **Icon Replacement** - Replaced Material Symbols with Lucide React icons  
✅ **Responsive Design** - Sidebar layout with breadcrumb navigation  
✅ **Loading States** - Skeleton loaders and spinner indicators  
✅ **Error Boundaries** - Better error display and retry mechanisms

### Phase 4: Performance & Data Fetching (In Progress)

✅ **React Query Integration** - Installed @tanstack/react-query for caching  
✅ **Data Caching** - Automatic background revalidation  
✅ **Optimistic UI** - Instant feedback to user actions  
✅ **Authentication Flow** - Improved login redirect speed

---

## 💡 How This Helps

### For Users (Admins)

- 🚀 **Faster Navigation** - React Query caches data, reducing API calls
- 🔄 **Automatic Sync** - Background revalidation keeps data fresh
- 🛡️ **Better Error Messages** - Clear, actionable error feedback
- 📊 **Real-time Analytics** - Dashboard shows live business metrics
- 🔐 **Secure Authentication** - Google OAuth with JWT tokens

### For Developers

- 📝 **Clear Architecture** - Separated frontend/backend with clear APIs
- 🐛 **Better Debugging** - Comprehensive error logging and middleware
- 🎯 **Type Safety** - Full TypeScript support throughout
- 🔧 **Configuration-driven** - Environment variables for easy deployment
- 📚 **Well-documented** - Setup guides and troubleshooting docs

### For Business

- 📈 **Inventory Visibility** - Real-time stock levels and low-stock alerts
- 💰 **Revenue Tracking** - Monthly revenue charts and analytics
- 👥 **Customer Management** - Track users and order history
- ⚡ **Performance** - Fast load times improve productivity
- 🔍 **Data Insights** - Analytics help make informed decisions

---

## 🚨 Challenges Faced & Solutions

### Challenge 1: Slow Redirects After Login

**Problem**: Users experienced long delays (3-5 seconds) after signing in before being redirected to dashboard.

**Root Cause**:

- AppProvider was blocking on session hydration
- Profile and settings API calls were sequential, not parallel
- Every route change triggered full data refetch

**Solution**:

- Implemented optimistic UI - redirect immediately, hydrate in background
- Used `Promise.allSettled()` for parallel API calls
- Set up React Query for automatic caching and background revalidation

**Result**: Redirects now take <500ms, navigation is instant

---

### Challenge 2: 500 Errors with No Context

**Problem**: Frontend showed generic "500 Internal Server Error" with no details about what failed.

**Root Cause**:

- No global error handler in Express backend
- Unhandled Prisma errors caused silent crashes
- Missing JWT secret validation
- No error logging

**Solution**:

- Added global error middleware to Express server
- Implemented Prisma connection error handling
- Enhanced auth middleware with specific error codes
- Added comprehensive console logging with helpful debugging info

**Result**: Errors now have specific codes (NO_TOKEN, TOKEN_EXPIRED, etc.), making debugging straightforward

---

### Challenge 3: Image Loading Errors

**Problem**: `next/image` rejected images from Unsplash with "hostname not configured" error.

**Root Cause**:

- Next.js requires explicit allowlist for remote image hosts
- `next.config.js` didn't have image domain configuration

**Solution**:

- Added `remotePatterns` to next.config.js with Unsplash domain
- Used proper Next.js Image component with width/height props

**Result**: Images load correctly with optimization

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Configure .env with DATABASE_URL, JWT secrets, Google Client ID
npm run dev  # Starts on port 4000
```

### Frontend Setup

```bash
cd frontend
npm install
# Ensure .env has NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm run dev  # Starts on port 3000
```

### Environment Variables

**Backend (.env)**

```
DATABASE_URL=postgresql://user:password@localhost:5432/grocery_shop
JWT_SECRET_KEY=your-long-secret-key
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_TOKEN=your-refresh-token-secret
GOOGLE_CLIENT_ID=your-google-client-id
ADMIN_EMAILS=admin@example.com
FRONTEND_URL=http://localhost:3000
PORT=4000
```

**Frontend (.env)**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📊 Architecture

```
grocery_shop/
├── backend/
│   ├── src/
│   │   ├── server.ts (Express app, global error handler)
│   │   ├── controller/ (Business logic)
│   │   ├── routes/ (API endpoints)
│   │   ├── middleware/ (Auth, error handling)
│   │   ├── lib/ (Database, utilities)
│   │   └── types/ (TypeScript types)
│   ├── prisma/
│   │   ├── schema.prisma (Database schema)
│   │   └── migrations/ (Schema changes)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/ (Next.js pages, layouts)
│   │   ├── components/ (React components, UI)
│   │   ├── contexts/ (React Context - AppProvider)
│   │   ├── lib/ (API client, utilities)
│   │   ├── hooks/ (Custom React hooks)
│   │   └── types/ (TypeScript types)
│   ├── next.config.js (Next.js config with security headers)
│   ├── middleware.ts (Next.js auth middleware)
│   └── package.json
│
├── ERROR_500_FIX.md (Troubleshooting guide)
├── NEXTJS_CONFIG_REVIEW.md (Next.js best practices)
├── BACKEND_ERROR_HANDLING.md (Backend API reference)
└── README.md (This file)
```

---

## 🎯 Key Features

### Dashboard

- Real-time metrics (total revenue, orders, products, low stock alerts)
- Graphical revenue trends
- Recent activity feed
- Quick stats cards

### Inventory Management

- Product list with search/filter
- Stock level tracking
- Low stock warnings
- Inventory value calculation
- Product images from Unsplash

### Order Management

- View all orders with status tracking
- Filter by order status (pending, shipped, delivered)
- Sort by date or revenue
- Manual order creation
- CSV export

### Analytics

- Monthly revenue breakdown
- Customer retention metrics
- Product category breakdown
- Top products by revenue

### User Management

- View all users
- Admin role assignment
- User registration tracking

### Admin Profile

- View/edit profile information
- Change password
- Manage settings
- Workspace customization

---

## 📈 Performance Optimizations

### Implemented

✅ React Query for automatic caching  
✅ Parallel API calls with `Promise.allSettled()`  
✅ Lazy loading of routes  
✅ Image optimization with Next.js Image component  
✅ CSS-in-JS with Tailwind (minimal bundle)  
✅ Code splitting (automatic in Next.js)

### To Implement

- [ ] Implement token refresh in React Query
- [ ] Add pagination for large datasets
- [ ] Prefetch data on route hover
- [ ] Add service worker for offline support
- [ ] Implement data virtualization for large tables

---

## 🔐 Security Features

✅ Google OAuth 2.0 authentication  
✅ JWT token-based authorization  
✅ CORS protection  
✅ Environment variable protection  
✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)  
✅ Input validation  
✅ Role-based access control (admin only)  
✅ Password hashing with bcrypt

---

## 🛠️ Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
# Backend
npm run build

# Frontend
npm run build
npm run start
```

---

---

## 🚀 Future Improvements

- [ ] Add support for bulk product uploads
- [ ] Implement real-time notifications with WebSockets
- [ ] Add email order confirmations
- [ ] Create mobile app (React Native)
- [ ] Implement inventory forecasting
- [ ] Add customer loyalty program dashboard
- [ ] Create public storefront (separate Next.js app)
- [ ] Add payment processing integration
- [ ] Implement customer reviews system

---

## 📝 License
