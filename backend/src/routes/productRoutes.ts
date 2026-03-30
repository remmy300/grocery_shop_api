import expresss from "express";
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controller/productController";

const router = expresss.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
