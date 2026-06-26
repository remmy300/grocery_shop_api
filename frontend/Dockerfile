# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Next.js public env variables must exist at build time
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build Next.js application
RUN npm run build


# ─────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production


# Copy package files
COPY --from=builder /app/package*.json ./


# Install only production dependencies
RUN npm ci --omit=dev


# Copy Next.js production build
COPY --from=builder /app/.next ./.next

# Copy static assets
COPY --from=builder /app/public ./public


# Next config (if you have one)
COPY --from=builder /app/next.config.* ./


EXPOSE 3000


CMD ["npm", "run", "start"]