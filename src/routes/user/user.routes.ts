import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { createUserAISubscription, getUserProfile } from "../../controllers/user/user.controller.js";


const router = express.Router();

router.get("/:userId", passportJWTMiddleware, getUserProfile)
router.post("/ai-subscription", passportJWTMiddleware, createUserAISubscription);

export default router;