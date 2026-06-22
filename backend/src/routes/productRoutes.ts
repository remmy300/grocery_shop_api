import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controller/productController.js";

const router = express.Router();

router.get("/search", searchProducts);
router.post("/", auth, authorizeRoles("admin"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", auth, authorizeRoles("admin"), updateProduct);
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);

export default router;
