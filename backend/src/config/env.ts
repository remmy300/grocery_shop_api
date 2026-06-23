import dotenv from "dotenv";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`[ENV] Warning: Could not load .env file at ${envPath}`);
} else {
  console.log(
    `[ENV] ✓ Loaded ${Object.keys(result.parsed || {}).length} variables from .env`,
  );
}

// Log which required M-Pesa env vars are set (without showing values)
const mpesaVars = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORT_CODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
  "MPESA_ENVIRONMENT",
];

mpesaVars.forEach((key) => {
  const isSet = !!process.env[key];
  console.log(`[ENV] ${key}: ${isSet ? "✓" : "✗"}`);
});
