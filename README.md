# Grocery Shop

A grocery ordering app with M-Pesa payments and an admin dashboard.

- `backend/` — Express + Prisma (PostgreSQL) API
- `frontend/` — Next.js app

## Setup

### 1. Clerk (authentication)

Sign-in is handled by [Clerk](https://clerk.com), with Google configured as a
social connection.

1. Create a Clerk application at https://dashboard.clerk.com.
2. Under **User & Authentication → Social Connections**, enable **Google**.
3. Copy your keys from **API Keys**:
   - `backend/.env`: set `CLERK_SECRET_KEY`
   - `frontend/.env.local`: set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. In `backend/.env`, set `ADMIN_EMAILS` to a comma-separated list of emails
   that should be granted the `admin` role automatically on first sign-in.

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

Requires `DATABASE_URL` (PostgreSQL), `CLERK_SECRET_KEY`, `ADMIN_EMAILS`,
Cloudinary and M-Pesa (Daraja) credentials — see `backend/.env.example`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and
`NEXT_PUBLIC_API_BASE_URL` pointing at the backend — see `frontend/.env.local`.
