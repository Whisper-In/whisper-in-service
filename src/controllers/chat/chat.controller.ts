import { RequestHandler } from "express";
import * as chatDTOs from "../../dtos/chat/chat.dtos.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import * as chatService from "../../services/chat/chat.services.js";

export const getUserChats: RequestHandler = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const rawResults = await chatService.getUserChats(profileId);

    const results = rawResults.map<chatDTOs.IUserChatDto>((result) => {
      return {
        chatId: result.id,
        profiles: result.profiles
          .filter((p) => p.profile != null)
          .map<chatDTOs.IUserChatProfileDto>((p: any) => ({
            _id: p.profile.id,
            name: p.profile.name,
            isAI: p.profileModel == AIProfile.modelName,
            avatar: p.profile.avatar,
          })),
      };
    });

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

/*
export const getChatMessages: RequestHandler = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const rawResults = await chatService.getChatMessages(chatId);

    const results = rawResults.map<chatDTOs.IUserChatMessageDto>((result) => {
      return {
        message: result.message,
        sender: result.sender._id.toString(),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    });

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

export const insertNewChatMessage: RequestHandler = async (req, res, next) => {
  try {
    const {chatId, senderId, message} = req.body;
    
    const rawResult = await chatService.insertNewChatMessage(chatId, senderId, message);

    const result:chatDTOs.IUserChatMessageDto = {
      message: rawResult.message,
      sender: senderId,
      createdAt: rawResult.createdAt,
      updatedAt: rawResult.updatedAt
    }

    return res.status(201).send(result);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};
*/

export const createNewChat: RequestHandler = async (req, res, next) => {
  const { userId, aiProfileId } = req.body;

  try {
    const newChat = await chatService.createNewChat(userId, aiProfileId);

    res.status(201).send({
      chatId: newChat.id
    });
  } catch (error) {
    res.status(400).json({ error });
  }
}