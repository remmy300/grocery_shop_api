import rateLimit from "express-rate-limit";

const json429 = (message: string) => ({
  message,
  error: "RATE_LIMITED",
});

/** General API — 100 req / 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429("Too many requests."),
});

/** Auth endpoints — 20 attempts / 15 min (brute-force guard) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429("Too many login attempts. Try again in 15 minutes."),
});

/** Payment initiation — 10 req / min (prevents STK-push spam) */
export const paymentInitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429("Too many payment requests. Please wait a moment."),
});

/** M-Pesa callback — Safaricom may retry 3×; allow 30 / min from any IP */
export const callbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429("Callback rate limit exceeded."),
});

/** Cart mutations — 60 req / min */
export const cartLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429("Too many cart operations. Please slow down."),
});
