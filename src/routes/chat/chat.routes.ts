import express from "express";
import * as chatController from "../../controllers/chat/chat.controller";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware";
import { chatGPTSubscriptionMiddleware } from "../../middlewares/chat-gpt-subscription.middleware";

const router = express.Router();

router.get("/:chatId", passportJWTMiddleware, chatController.getChat);
router.put("/audio-reply/:chatId", passportJWTMiddleware, chatController.setChatAudioReply);
router.get("/user-chats/chats", passportJWTMiddleware, chatController.getUserChats);
router.post("/user-chats/new-chat", passportJWTMiddleware, chatController.createNewChat);
router.put("/block-profile", passportJWTMiddleware, chatController.updateChatProfileBlockStatus);
router.post("/chat-completion-vector-db", passportJWTMiddleware, chatController.getChatCompletionWithVectorDB);
router.post("/chat-completion", [passportJWTMiddleware, chatGPTSubscriptionMiddleware], chatController.getChatCompletion);
router.post("/chat-messages/message", passportJWTMiddleware, chatController.insertNewChatMessage);
router.get("/chat-messages/:chatId", passportJWTMiddleware, chatController.getChatMessages);

export default router;
