import express from "express";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { chatGPTSubscriptionMiddleware } from "../../middlewares/chatGPTSubscriptionMiddleware.js";

const router = express.Router();

router.post("/chat-completion", [passportJWTMiddleware, chatGPTSubscriptionMiddleware], getChatCompletion);

export default router;
