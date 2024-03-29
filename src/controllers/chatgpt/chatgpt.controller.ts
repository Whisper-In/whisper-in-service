import { RequestHandler } from "express";
import * as chatGPTService from "../../services/chatgpt/chatgpt.services";

export const getChatCompletion: RequestHandler = async (req, res, next) => {
  const { profileId, message, prevMessages } = req.body;
  
  try {
    const chatGPTResult = await chatGPTService.getChatCompletion(
      profileId,
      message,
      prevMessages
    );

    const today = new Date();
    let replyMessage = chatGPTResult?.content ?? "Sorry. Could you please repeat that?"; //TODO: Random message

    return res.status(200).send({
      message: replyMessage,
      sender: profileId,
      createdAt: today,
      updatedAt: today,
    });
  } catch (error) {        
    const today = new Date();

    return res.status(200).send({
      message: "Sorry. Could you please repeat that?",
      sender: profileId,
      createdAt: today,
      updatedAt: today,
      error
    });
  }
};
