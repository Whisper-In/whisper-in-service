import express from "express";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware";
import { chatGPTSubscriptionMiddleware } from "../../middlewares/chat-gpt-subscription.middleware";
import { chatBlockedMiddleware } from "../../middlewares/chat-status-checker.middlerware";

const router = express.Router();

router.post("/chat-completion", [
    passportJWTMiddleware,
    chatGPTSubscriptionMiddleware,
    chatBlockedMiddleware
],
    getChatCompletion);

export default router;
