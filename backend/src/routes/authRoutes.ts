import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import {
  googleLogin,
  refreshToken,
  getCurrentUser,
  getAdmins,
} from "../controller/googleAuth.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.get("/me", auth, getCurrentUser);
router.get("/admins", getAdmins); // Temporarily remove auth for demo

export default router;
