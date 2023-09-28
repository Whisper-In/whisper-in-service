import { Chat } from "../../models/chat/chat.model.js";
import { Types, mongo } from "mongoose";
import { ChatMessage } from "../../models/chat/chat-message.model.js";
import { IUserProfile, UserProfile } from "../../models/user/user-profile.model.js";
import { isFulfilled } from "../../utils/promise.js";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
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
            isAI: p.profile.isAIReplyOn,
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
      ]);

    const contactProfileIDs = chat?.profiles
      .filter((profile) => profile.profile != null)
      .map((profile) => profile.profile._id.toString());

    const features: string[] = [];

    if (contactProfileIDs?.length) {
      const queries = await Promise.allSettled([
        UserSubscription.find({ userId, subscribedUserId: { $in: contactProfileIDs }, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] }),
        UserProfile.find({ _id: { $in: contactProfileIDs } })
      ]);

      if (isFulfilled(queries[0]) && isFulfilled(queries[1])) {
        const userSubscriptions = queries[0].value;

        if (userSubscriptions?.length) {
          const profiles = queries[1].value;          

          profiles.forEach((profile) => {            
            const subscriptions = userSubscriptions.find((subscription) => subscription.subscribedUserId == profile.id);
            const priceTier = profile.priceTiers.find((priceTier) => priceTier.tier == subscriptions?.tier);

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

export const createNewChat = async (userId: string, contactProfileId: string) => {
  try {
    const existingChat = await Chat.findOne({ 'profiles.profile': { $all: [userId, contactProfileId] } });
    
    if (existingChat) {
      return existingChat;
    }

    const newChat = new Chat({
      profiles: [
        { profile: userId },
        { profile: contactProfileId }
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
    const existInUserProfile = await UserProfile.exists({ _id: senderId });

    if (!existInUserProfile?._id) {
      throw "Sender profile id provided does not exists.";
    }

    const newChatMessage = new ChatMessage({
      chat: new mongo.ObjectId(chatId),
      sender: new mongo.ObjectId(senderId),
      message,
    });

    const savedChatMessage = await newChatMessage.save();

    return savedChatMessage;
  } catch (error) {
    throw error;
  }
};
