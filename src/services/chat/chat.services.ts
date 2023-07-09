import { Chat } from "../../models/chat/chat.model.js";
import { Types, mongo } from "mongoose";
import { ChatMessage } from "../../models/chat/chat-message.model.js";
import { AIProfile, TierChatFeature } from "../../models/ai/ai-profile.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { isFulfilled } from "../../utils/promise.js";
import { UserAISubscription } from "../../models/user/user-ai-subscription.model.js";

export const getUserChats = async (userId: string) => {
  try {
    const userObjectId = new mongo.ObjectId(userId);
    const body = await Chat.find({
      profiles: { $elemMatch: { profile: userObjectId } },
    }).populate([
      {
        path: "profiles",
        populate: {
          path: "profile",
          match: { _id: { $ne: userObjectId } },
        },
      }
    ]);

    return body;
  } catch (error) {
    throw error;
  }
};


export const getChat = async (userId: string, chatId: string) => {
  try {
    const chat = await Chat.findById(chatId);

    const aiProfileIDs = chat?.profiles
      .filter((profile) => profile.profileModel == AIProfile.modelName)
      .map((profile) => profile.profile._id.toString());

    const features: TierChatFeature[] = [];

    if (aiProfileIDs?.length) {
      const queries = await Promise.allSettled([
        UserAISubscription.find({ userId, aiProfileId: { $in: aiProfileIDs } }),
        AIProfile.find({ _id: { $in: aiProfileIDs } })
      ]);

      if (isFulfilled(queries[0]) && isFulfilled(queries[1])) {
        const userAISubscriptions = queries[0].value;

        if (userAISubscriptions?.length) {
          const aiProfiles = queries[1].value;

          aiProfiles.forEach((profile) => {
            const aiProfileSubscription = userAISubscriptions.find((subscription) => subscription.aiProfileId == profile.id);
            const priceTier = profile.priceTiers.find((priceTier) => priceTier.tier == aiProfileSubscription?.tier);

            if (priceTier) {
              features.push(...priceTier.features);
            }            
          });
        }
      }

    }

    return {
      ...chat,
      features
    };
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

export const createNewChat = async (userId: string, aiProfileId: string) => {
  try {
    const existingChat = await Chat.findOne({ 'profiles.profile': { $all: [userId, aiProfileId] } });

    if (existingChat) {
      return existingChat;
    }

    const newChat = new Chat({
      profiles: [
        { profile: userId, profileModel: UserProfile.modelName },
        { profile: aiProfileId, profileModel: AIProfile.modelName }
      ]
    });

    await newChat.save();

    return newChat;
  } catch (error) {
    throw error;
  }
};

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
