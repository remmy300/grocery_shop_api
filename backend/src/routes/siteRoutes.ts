import express from "express";
import { validate } from "../middleware/validate.js";
import { siteFormLimiter } from "../middleware/rateLimiter.js";
import {
  createContactMessageSchema,
  subscribeNewsletterSchema,
} from "../schemas/index.js";
import {
  createContactMessage,
  subscribeNewsletter,
} from "../controller/siteController.js";

const router = express.Router();

router.post(
  "/newsletter/subscribe",
  siteFormLimiter,
  validate(subscribeNewsletterSchema),
  subscribeNewsletter,
);
router.post(
  "/contact",
  siteFormLimiter,
  validate(createContactMessageSchema),
  createContactMessage,
);

export default router;
