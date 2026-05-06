import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import {
  getAnalyticsOverview,
  getDashboardOverview,
  getInventoryOverview,
  getOrdersOverview,
  getProfile,
  getSettings,
  getUsersOverview,
  updatePassword,
  updateProfile,
  updateSettings,
} from "../controller/adminController.js";
import {
  generateCloudinarySignature,
  getCloudinaryConfig,
} from "../controller/cloudinaryController.js";

const router = express.Router();

router.use(auth, authorizeRoles("admin"));

router.get("/dashboard", getDashboardOverview);
router.get("/inventory", getInventoryOverview);
router.get("/orders", getOrdersOverview);
router.get("/users", getUsersOverview);
router.get("/analytics", getAnalyticsOverview);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/password", updatePassword);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/cloudinary/config", getCloudinaryConfig);
router.post("/cloudinary/signature", generateCloudinarySignature);

export default router;
