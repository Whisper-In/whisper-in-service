import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { createUserAISubscription, getUserProfile, updateUserProfile, updateUserTnC } from "../../controllers/user/user.controller.js";

const router = express.Router();

router.put("/", passportJWTMiddleware, updateUserProfile);
router.put("/tnc", updateUserTnC)
router.get("/:userId", passportJWTMiddleware, getUserProfile)
router.post("/ai-subscription", passportJWTMiddleware, createUserAISubscription);

export default router;