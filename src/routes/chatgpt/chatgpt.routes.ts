import express from "express";
import { getChatCompletion } from "../../controllers/chatgpt/chatgpt.controller.js";

const router = express.Router();

router.route("/chat-completion").post(getChatCompletion);

export default router;