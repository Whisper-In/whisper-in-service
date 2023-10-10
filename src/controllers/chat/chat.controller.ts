import { RequestHandler } from "express";
import * as chatService from "../../services/chat/chat.services.js";
import * as chatGPTService from "../../services/chatgpt/chatgpt.services.js";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { mongo } from "mongoose";
import { IChatMessage } from "../../models/chat/chat-message.model.js";

export const getUserChats: RequestHandler = async (req, res, next) => {
  try {
    const user: any = req.user;
    const userId = user["_id"];

    const results = await chatService.getUserChats(userId);

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

export const getChat: RequestHandler = async (req, res, next) => {
  try {
    const user: any = req.user;
    const userId = user["_id"];

    const { chatId } = req.params;

    const chat = await chatService.getChat(userId, chatId);

    res.status(200).json(chat);
  } catch (error) {
    res.status(400).json({ error });
  }
}

export const getChatMessages: RequestHandler = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { pageIndex, messageCount } = req.query;
    
    const results = await chatService.getChatMessages(chatId, Number.parseInt(pageIndex as string), Number.parseInt(messageCount as string));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const createNewChat: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  const userId = user["_id"];

  const { profileId } = req.body;

  try {
    const newChat = await chatService.createNewChat(userId, profileId);

    res.status(201).send({
      chatId: newChat.id
    });
  } catch (error) {
    res.status(400).json({ error });
  }
}

export const updateChatProfileBlockStatus: RequestHandler = async (req, res, next) => {
  const { userId, aiProfileId, isBlocked } = req.body;

  try {
    const result = await chatService.updateChatProfileBlockStatus(userId, aiProfileId, isBlocked);

    res.status(204).send(result);
  } catch (error) {
    res.status(400).json({ error });
  }
}

export const insertNewChatMessage: RequestHandler = async (req, res, next) => {
  try {
    const { chatId, message, senderId } = req.body;

    const result = await chatService.insertNewChatMessage(chatId, senderId, message);

    res.status(201).send(result);
  } catch (error) {
    res.status(400).json({ error });
  }
}

export const getChatCompletion: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  const userId = user["_id"];
  const { chatId, profileId, message } = req.body;

  const today = new Date();

  try {
    const result = await chatService.getChatMessages(chatId, 0, 250);

    const prevMessages = result.messages.map<ChatCompletionMessageParam>((message) => ({
      content: message.message,
      role: message.sender == userId ? "user" : "assistant"
    }))

    const chatCompletionResult = await chatGPTService.getChatCompletion(profileId, message, prevMessages);    

    if (chatCompletionResult.content) {
      const result = await chatService.insertNewChatMessage(chatId, profileId, chatCompletionResult.content);
      
      res.status(200).json(result);
    } else {
      throw "ChatGPT returned empty content."
    }
  } catch (error) {
    res.status(200).json(<IChatMessage>{
      chatId: chatId,
      messageId: new mongo.ObjectId(),
      message: "Sorry. Could you please repeat that?",
      sender: profileId,
      createdAt: today,
      updatedAt: today,
      error
    });
  }
}

export const getChatCompletionWithVectorDB: RequestHandler = async (req, res, next) => {
  try {
    const user: any = req.user;
    const userId = user["_id"];
    const { chatId, recipientUserId, message } = req.body;

    const result = await chatService.getChatCompletionWithVectorDB(
      chatId,
      recipientUserId,
      message
    );

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({ error });
  }
}