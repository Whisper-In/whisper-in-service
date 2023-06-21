import express from "express";
import { cancelSubscription, createPaymentSheet } from "../../controllers/payment/payment.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.post('/payment-sheet', passportJWTMiddleware, createPaymentSheet);
router.post('/cancel-subscription', passportJWTMiddleware, cancelSubscription);

export default router;