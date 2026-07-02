import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { googleLoginSchema, refreshTokenSchema } from "../schemas/index.js";
import {
  googleLogin,
  refreshToken,
  getCurrentUser,
  getAdmins,
  logout,
} from "../controller/googleAuth.js";

const router = express.Router();

router.post("/google", authLimiter, validate(googleLoginSchema), googleLogin);
router.post("/refresh", authLimiter, validate(refreshTokenSchema), refreshToken);
router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);
// Requires admin — prevents exposing admin email list to the public
router.get("/admins", auth, authorizeRoles("admin"), getAdmins);

export default router;
