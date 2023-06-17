import express from "express";
import passport from "passport";
import * as chatController from "../../controllers/chat/chat.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.get("/user-chats/:profileId", passportJWTMiddleware, chatController.getUserChats);

router.post("/user-chats/new-chat", passportJWTMiddleware, chatController.createNewChat);

//router.route("/chat-messages/:chatId").get(chatController.getChatMessages);
//router.route("/chat-messages/insert").post(chatController.insertNewChatMessage);

export default router;
