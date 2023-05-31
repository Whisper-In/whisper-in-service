import express from "express";
import passport from "passport";
import * as chatController from "../../controllers/chat/chat.controller.js";
import { passpotJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.get(
  "/user-chats/:profileId",
  passpotJWTMiddleware,
  chatController.getUserChats
);
//router.route("/chat-messages/:chatId").get(chatController.getChatMessages);
//router.route("/chat-messages/insert").post(chatController.insertNewChatMessage);

export default router;
