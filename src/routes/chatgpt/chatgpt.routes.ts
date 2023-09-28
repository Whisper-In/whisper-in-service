import express from "express";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";
import { chatGPTSubscriptionMiddleware } from "../../middlewares/chat-gpt-subscription.middleware.js";
import { chatBlockedMiddleware } from "../../middlewares/chat-status-checker.middlerware.js";

const router = express.Router();

router.post("/chat-completion", [
    passportJWTMiddleware,
    chatGPTSubscriptionMiddleware,
    chatBlockedMiddleware
],
    getChatCompletion);

export default router;
