import express from "express";
import * as chatController from "../../controllers/chat/chat.controller.js";

const router = express.Router();

router.route("/user-chats/:profileId").get(chatController.getUserChats);
//router.route("/chat-messages/:chatId").get(chatController.getChatMessages);
//router.route("/chat-messages/insert").post(chatController.insertNewChatMessage);

export default router;