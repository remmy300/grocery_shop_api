import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  syncUser,
  getCurrentUser,
  getAdmins,
  logout,
} from "../controller/googleAuth.js";

const router = express.Router();

router.post("/sync", authLimiter, auth, syncUser);
router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);
// Requires admin — prevents exposing admin email list to the public
router.get("/admins", auth, authorizeRoles("admin"), getAdmins);

export default router;
