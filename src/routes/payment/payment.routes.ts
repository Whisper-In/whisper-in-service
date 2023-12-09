import express from "express";
import { cancelSubscription, createPaymentSheet } from "../../controllers/payment/payment.controller";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware";

const router = express.Router();

router.post('/payment-sheet', passportJWTMiddleware, createPaymentSheet);
router.post('/cancel-subscription', passportJWTMiddleware, cancelSubscription);

export default router;