import express from "express";
import passport from "passport";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller.js";
import { passpotJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.post("/chat-completion", passpotJWTMiddleware, getChatCompletion);

export default router;
