import express from "express";
import { auth, authorizeRoles } from "../middleware/auth";
import {
  googleLogin,
  refreshToken,
  getCurrentUser,
  getAdmins,
} from "../controller/googleAuth";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.get("/me", auth, getCurrentUser);
router.get("/admins", auth, authorizeRoles("admin"), getAdmins);

export default router;
