import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { createUserAISubscription } from "../../controllers/user/user.controller.js";

const router = express.Router();

router.post("/ai-subscription", passportJWTMiddleware, createUserAISubscription);

export default router;