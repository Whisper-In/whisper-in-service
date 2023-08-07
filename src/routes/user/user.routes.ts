import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { createUserAISubscription, getUserProfile, updateUserProfile } from "../../controllers/user/user.controller.js";

const router = express.Router();

router.put("/", passportJWTMiddleware, updateUserProfile);
router.get("/:userId", passportJWTMiddleware, getUserProfile)
router.post("/ai-subscription", passportJWTMiddleware, createUserAISubscription);

export default router;