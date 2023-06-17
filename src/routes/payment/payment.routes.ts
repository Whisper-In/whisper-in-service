import express from "express";
import { createPaymentSheet, paymentWebhook } from "../../controllers/payment/payment.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.post('/payment-sheet', passportJWTMiddleware, createPaymentSheet);

export default router;