import express from "express";
import { auth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  googleLogin,
  refreshToken,
  getCurrentUser,
  getAdmins,
  logout,
} from "../controller/googleAuth.js";

const router = express.Router();

router.post("/google", authLimiter, googleLogin);
router.post("/refresh", authLimiter, refreshToken);
router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);
router.get("/admins", getAdmins);

export default router;
