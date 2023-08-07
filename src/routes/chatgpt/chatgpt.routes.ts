import express from "express";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { chatGPTSubscriptionMiddleware } from "../../middlewares/chatGPTSubscriptionMiddleware.js";
import { chatBlockedMiddleware } from "../../middlewares/chatBlockedMiddleware.js";

const router = express.Router();

router.post("/chat-completion", [
    passportJWTMiddleware,
    chatGPTSubscriptionMiddleware,
    chatBlockedMiddleware
],
    getChatCompletion);

export default router;
