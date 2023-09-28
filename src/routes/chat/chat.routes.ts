import express from "express";
import passport from "passport";
import * as chatController from "../../controllers/chat/chat.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";

const router = express.Router();

router.get("/:chatId", passportJWTMiddleware, chatController.getChat);

router.get("/user-chats/chats", passportJWTMiddleware, chatController.getUserChats);

router.post("/user-chats/new-chat", passportJWTMiddleware, chatController.createNewChat);

router.put("/block-profile", passportJWTMiddleware, chatController.updateChatProfileBlockStatus);

//router.route("/chat-messages/:chatId").get(chatController.getChatMessages);
//router.route("/chat-messages/insert").post(chatController.insertNewChatMessage);

export default router;
