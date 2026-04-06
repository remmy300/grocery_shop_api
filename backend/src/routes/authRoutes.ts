import express from "express";
import { googleLogin, refreshToken } from "../controller/googleAuth";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/refresh", refreshToken);

export default router;
