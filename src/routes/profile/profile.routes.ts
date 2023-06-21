import express from "express";
import * as profileController from "../../controllers/profile/profile.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.get(
  "/:profileId",
  passportJWTMiddleware,
  profileController.getProfile
);

router.get("/search/:query", passportJWTMiddleware, profileController.searchProfiles);

router.post('/payment-sheet', passportJWTMiddleware, profileController.createPaymentSheet);

router.post('/payment-subscription', passportJWTMiddleware, profileController.createPaymentSubscription);
router.post('/cancel-subscription', passportJWTMiddleware, profileController.cancelSubscription);

export default router;
