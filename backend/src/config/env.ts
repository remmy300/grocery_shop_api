import dotenv from "dotenv";
import { resolve } from "node:path";

// Load from project root, not relative to file location
// This works for both dev (ts-node) and production (compiled js)
const envPath = resolve(process.cwd(), ".env");
const envLocalPath = resolve(process.cwd(), ".env.local");

console.log("[ENV] Loading from:", envPath);

// Try .env.local first (production/specific overrides), then .env
const result = dotenv.config({ path: envLocalPath });

if (result.error && result.error.code === "ENOENT") {
  console.log("[ENV] .env.local not found, trying .env");
  const envResult = dotenv.config({ path: envPath });

  if (envResult.error) {
    console.warn(`[ENV] Warning: Could not load .env file at ${envPath}`);
  } else {
    console.log(
      `[ENV] ✓ Loaded ${Object.keys(envResult.parsed || {}).length} variables from .env`,
    );
  }
} else if (result.error) {
  console.warn(
    `[ENV] Warning: Could not load .env.local file at ${envLocalPath}`,
  );
} else {
  console.log(
    `[ENV] ✓ Loaded ${Object.keys(result.parsed || {}).length} variables from .env.local`,
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
