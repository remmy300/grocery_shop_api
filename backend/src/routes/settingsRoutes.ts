import express from "express";
import { getPublicSettings } from "../controller/adminController.js";

const router = express.Router();

router.get("/", getPublicSettings);

export default router;
