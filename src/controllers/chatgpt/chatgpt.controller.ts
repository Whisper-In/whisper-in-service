import { RequestHandler } from "express";
import * as chatGPTService from "../../services/chatgpt/chatgpt.services.js";
import * as chatService from "../../services/chat/chat.services.js";
import { IUserChatMessageDto } from "../../dtos/chat/chat.dtos.js";

export const getChatCompletion: RequestHandler = async (req, res, next) => {
  const { aiProfileId, message, prevMessages } = req.body;
  try {
    const chatGPTResult = await chatGPTService.getChatCompletion(
      aiProfileId,
      message,
      prevMessages
    );

    let result: IUserChatMessageDto;
    const today = new Date();
    let replyMessage = chatGPTResult?.content ?? "Sorry. Could you please repeat that?"; //TODO: Random message

    return res.status(200).send({
      message: replyMessage,
      sender: aiProfileId,
      createdAt: today,
      updatedAt: today,
    });
  } catch (error) {
    const today = new Date();

    return res.status(200).send({
      message: "Sorry. Could you please repeat that?",
      sender: aiProfileId,
      createdAt: today,
      updatedAt: today,
      error
    });
  }
};
