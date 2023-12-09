import { RequestHandler } from "express";
import * as chatService from "../../services/chat/chat.services";
import * as chatGPTService from "../../services/chatgpt/chatgpt.services";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Chat } from "../../models/chat/chat.model";

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
    const { _id } = <any>req.user;
    const { chatId } = req.params;
    const { pageIndex, messageCount } = req.query;

    const results = await chatService.getChatMessages(chatId, _id, Number.parseInt(pageIndex as string), Number.parseInt(messageCount as string));

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
    const { _id } = <any>req.user;
    const { chatId, message, senderId, isAudio } = req.body;

    const result = await chatService.insertNewChatMessage(chatId, senderId ?? _id, message, isAudio);

    res.status(201).send(result);
  } catch (error) {
    res.status(400).json({ error });
  }
}

export const getChatCompletion: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  const userId = user["_id"];
  const { chatId, profileId, message } = req.body;

  let replyMessage = "";

  try {
    const result = await chatService.getChatMessages(chatId, userId, 0, 250);

    const prevMessages = result.messages.map<ChatCompletionMessageParam>((message) => ({
      content: message.message,
      role: message.sender == userId ? "user" : "assistant"
    }))

    const chatCompletionResult = await chatGPTService.getChatCompletion(profileId, message, prevMessages);

    if (chatCompletionResult.content) {
      replyMessage = chatCompletionResult.content;
    } else {
      replyMessage = "ChatGPT returned empty content.";
    }
  } catch (error) {
    console.log(error)
    replyMessage = "Sorry. Could you please repeat that?";
  }

  const chat = await Chat.findById(chatId);

  const result = await chatService.insertNewChatMessage(chatId, profileId, replyMessage, chat?.isAudioOn);

  res.status(200).json(result);
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

export const setChatAudioReply: RequestHandler = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { isAudioOn } = req.body;
    const result = await chatService.setChatAudioReply(chatId, isAudioOn);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({ error });
  }
}