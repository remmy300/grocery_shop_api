import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../schemas/index.js";
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
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", auth, authorizeRoles("admin"), validate(createProductSchema), createProduct);
router.put("/:id", auth, authorizeRoles("admin"), validate(updateProductSchema), updateProduct);
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);

export default router;
