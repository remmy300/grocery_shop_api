import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Trust one proxy hop (ngrok in dev, nginx/load-balancer in prod).
// This lets express-rate-limit read X-Forwarded-For for real client IPs.
app.set("trust proxy", 1);

const rawCorsOrigins =
  process.env.CORS_ORIGIN ?? process.env.FRONTEND_URL ?? "";
const allowedOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  const devAllow = ["http://localhost:3000", "http://127.0.0.1:3000"];
  devAllow.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  }),
);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(requestOrigin)
      ) {
        return callback(null, true);
      }
      console.warn("[CORS] blocked origin:", requestOrigin);
      return callback(
        new Error(`CORS policy blocked origin: ${requestOrigin}`),
        false,
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Parse cookies for HttpOnly auth tokens
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

// Global rate limit — tighter per-route limits applied in route files
app.use(generalLimiter);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api", siteRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Error caught by global handler:", err);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production" ? "An error occurred" : message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  },
);

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});

server.on("close", () => {
  console.log(" SERVER CLOSED");
});

server.on("error", (error) => {
  console.error(" SERVER ERROR:", error);
});

process.on("exit", (code) => {
  console.log(" PROCESS EXIT:", code);
});
