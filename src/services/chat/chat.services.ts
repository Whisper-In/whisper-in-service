import { Chat } from "../../models/chat/chat.model.js";
import { mongo } from "mongoose";
import { ChatMessage } from "../../models/chat/chat-message.model.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { isFulfilled } from "../../utils/promise.js";

export const getUserChats = async (profileId: string) => {
  try {
    const profileObjectId = new mongo.ObjectId(profileId);
    const body = await Chat.find({
      profiles: { $elemMatch: { profile: profileObjectId } },
    }).populate([
      {
        path: "profiles",
        populate: {
          path: "profile",
          match: { _id: { $ne: profileObjectId } },
        },
      }
    ]);

    return body;
  } catch (error) {
    throw error;
  }
};

export const getChatMessages = async (chatId: string) => {
  try {
    const chatObjectId = new mongo.ObjectId(chatId);

    const body = ChatMessage.find({
      chat: chatObjectId,
    }).sort({ createdAt: 1 });

    return body;
  } catch (error) {
    throw error;
  }
};

export const createNewChat = async (contactId: string) => {};

export const insertNewChatMessage = async (
  chatId: string,
  senderId: string,
  message: string
) => {
  try {
    const existInUserProfileQuery = UserProfile.exists({ _id: senderId });
    const existsInAIProfileQuery = AIProfile.exists({ _id: senderId });

    const isExistResults = await Promise.allSettled([
      existInUserProfileQuery,
      existsInAIProfileQuery,
    ]);

    let senderModel = "";
    if (isFulfilled(isExistResults[0]) && isExistResults[0].value?._id) {
      senderModel = UserProfile.modelName!;
    } else if (isFulfilled(isExistResults[1]) && isExistResults[1].value?._id) {
      senderModel = AIProfile.modelName!;
    } else {
      throw "Sender profile id provided does not exists.";
    }    

    const newChatMessage = new ChatMessage({
      chat: new mongo.ObjectId(chatId),
      sender: new mongo.ObjectId(senderId),
      senderModel,
      message,
    });

    const savedChatMessage = await newChatMessage.save();

    return savedChatMessage;
  } catch (error) {
    throw error;
  }
};
