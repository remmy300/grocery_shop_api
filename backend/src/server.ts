import "./config/env.js";
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma.js";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

const rawCorsOrigins =
  process.env.CORS_ORIGIN ?? process.env.FRONTEND_URL ?? "";
const allowedOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// In development, allow localhost origins to make local frontend dev convenient
if (process.env.NODE_ENV !== "production") {
  const devAllow = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ];
  devAllow.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      try {
        console.log("[CORS] incoming Origin:", requestOrigin);
        console.log("[CORS] configured origins:", allowedOrigins);
      } catch (e) {}

      if (!requestOrigin) {
        // Allow non-browser requests like server-to-server or curl
        console.log("[CORS] no Origin header present - allowing request");
        return callback(null, true);
      }

      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(requestOrigin)
      ) {
        console.log("[CORS] allowed origin:", requestOrigin);
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

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

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

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(` NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});
