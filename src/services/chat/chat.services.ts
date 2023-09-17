import { Chat } from "../../models/chat/chat.model.js";
import { Types, mongo } from "mongoose";
import { ChatMessage } from "../../models/chat/chat-message.model.js";
import { AIProfile, TierChatFeature } from "../../models/ai/ai-profile.model.js";
import { IUserProfile, UserProfile } from "../../models/user/user-profile.model.js";
import { isFulfilled } from "../../utils/promise.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";
import { IUserChatDto, IUserChatProfileDto } from "../../dtos/chat/chat.dtos.js";

export const getUserChats = async (userId: string) => {
  try {
    const userObjectId = new mongo.ObjectId(userId);
    const result = await Chat.find({
      profiles: { $elemMatch: { profile: userObjectId } },
    }).populate([
      {
        path: "profiles",
        populate: {
          path: "profile",
          match: { _id: { $ne: userObjectId } },
        }
      }
    ]);

    return result.map<IUserChatDto>((result) => {
      return {
        chatId: result.id,
        profiles: result.profiles
          .filter((p) => p.profile != null)
          .map<IUserChatProfileDto>((p: any) => ({
            _id: p.profile.id,
            name: p.profile.name,
            isAI: p.profileModel == AIProfile.modelName,
            avatar: p.profile.avatar,
            isBlocked: p.blocked
          })
          ),
      };
    });
  } catch (error) {
    throw error;
  }
};

export const updateChatProfileBlockStatus = async (userId: string, aiProfileId: string, isBlocked: boolean) => {
  try {
    const userObjectId = new mongo.ObjectId(userId);
    const aiProfileObjectId = new mongo.ObjectId(aiProfileId);

    const result = await Chat.findOne({
      'profiles.profile': {
        $all: [userObjectId, aiProfileObjectId],
      }
    });

    const aiProfile = result?.profiles.find((p) => p.profile.toString() == aiProfileId);

    if (aiProfile) {
      aiProfile.blocked = isBlocked;

      await result?.save();
    }

    return result;
  } catch (error) {
    throw error;
  }
}


export const getChat = async (userId: string, chatId: string) => {
  try {
    const userObjectId = new mongo.ObjectId(userId);
    const chat = await Chat.findById(chatId)
      .populate([
        {
          path: "profiles",
          populate: {
            path: "profile",
            match: { _id: { $ne: userObjectId } },
          }
        }
      ])

    const aiProfileIDs = chat?.profiles
      .filter((profile) => profile.profileModel == AIProfile.modelName)
      .map((profile) => profile.profile._id.toString());

    const features: string[] = [];

    if (aiProfileIDs?.length) {
      const queries = await Promise.allSettled([
        UserAISubscription.find({ userId, aiProfileId: { $in: aiProfileIDs }, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] }),
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
      chatId: chat?.id,
      profiles: chat?.profiles.filter((p) => p.profile != null).map((p: any) => ({
        _id: p.profile.id,
        name: p.profile.name,
        isAI: p.profileModel == AIProfile.modelName,
        avatar: p.profile.avatar,
        isBlocked: p.blocked
      })),
      createdAt: chat?.createdAt,
      updatedAt: chat?.updatedAt,
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
