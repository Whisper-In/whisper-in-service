import { Chat } from "../../models/chat/chat.model";
import { mongo } from "mongoose";
import { ChatMessage, IChatMessage } from "../../models/chat/chat-message.model";
import { IUserProfile, UserProfile } from "../../models/user/user-profile.model";
import { isFulfilled } from "../../utils/promise";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model";
import axios from "axios";

export const getUserChats = async (userId: string) => {
  try {
    const userObjectId = new mongo.ObjectId(userId);
    const results = await Chat.aggregate([
      {
        $match: {
          profiles: { $elemMatch: { profile: userObjectId } }
        }
      },
      {
        $lookup: {
          from: ChatMessage.collection.name,
          localField: "_id",
          foreignField: "chatId",
          as: "lastMessage",
          pipeline: [
            {
              $sort: { createAt: 1, _id: 1 }
            }
          ]
        }
      },
      {
        $lookup: {
          from: UserProfile.collection.name,
          localField: "profiles.profile",
          foreignField: "_id",
          as: "profiles",
        }
      },
      {
        $project: {
          _id: false,
          chatId: "$_id",
          isAudioOn: true,
          lastMessage: { $last: "$lastMessage" },
          profile: { $first: "$profiles" },
        }
      }
    ]);

    return results;
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

export const setChatAudioReply = async (chatId: string, isAudioOn: boolean) => {
  try {
    const result = await Chat.findByIdAndUpdate(chatId, {
      isAudioOn
    }, { new: true });

    return result;
  } catch (error) {
    throw error;
  }
}


export const getChat = async (userId: string, chatId: string) => {
  try {
    const chat = await Chat.findOne({
      _id: chatId,
      profiles: { $elemMatch: { profile: userId } }
    })
      .populate([
        {
          path: "profiles",
          populate: {
            path: "profile",
            match: { _id: { $ne: userId } },
            select: {
              name: 1,
              avatar: 1,
              isBlocked: 1,
              isSubscriptionOn: 1,
              priceTiers: 1
            }
          }
        }
      ]);

    if (!chat) {
      return undefined;
    }

    const profile: IUserProfile = <any>chat?.profiles.find((p) => p.profile != null)?.profile;

    const features: string[] = [];

    const userSubscription = await UserSubscription.findOne({ userId, subscribedUserId: profile?._id, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] });
    const priceTier = profile.priceTiers?.find((priceTier) => priceTier.tier == userSubscription?.tier);

    if (priceTier) {
      features.push(...priceTier.features);
    }

    return {
      chatId: chat?.id,
      profile,
      createdAt: chat?.createdAt,
      updatedAt: chat?.updatedAt,
      isAudioOn: chat?.isAudioOn,
      //features
    };
  } catch (error) {
    throw error;
  }
};

export const getChatMessages = async (chatId: string, userId: string, pageIndex: number, messageCount: number) => {
  try {
    let totalMessages = 0;
    let messages: any[] = [];

    const chatExists = await Chat.exists({
      _id: chatId,
      profiles: {
        $elemMatch: { profile: userId }
      }
    });

    if (messageCount > 0 && chatExists?._id) {
      const chatObjectId = new mongo.ObjectId(chatId);

      totalMessages = await ChatMessage.count({ chatId: chatObjectId });

      messages = await ChatMessage.find({
        chatId: chatObjectId,
      }).sort({ createdAt: -1, _id: -1 })
        .skip(pageIndex * messageCount)
        .limit(messageCount)
        .transform((messages) => messages.map((m) => ({
          messageId: m._id,
          message: m.message,
          sender: m.sender,
          isSender: m.sender.toString() == userId,
          isAudio: m.isAudio,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt
        })));
    }

    return {
      chatId,
      messages,
      totalMessages
    };
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
  message: string,
  isAudio?: boolean
) => {
  try {
    const chat = await Chat.findOne({
      _id: chatId,
      profiles: {
        $elemMatch: { profile: senderId }
      }
    });

    if (!chat?._id) {
      throw "Invalid chat id provided.";
    }

    const existInUserProfile = await UserProfile.exists({ _id: senderId });

    if (!existInUserProfile?._id) {
      throw "Sender profile id provided does not exists.";
    }

    const newChatMessage = new ChatMessage({
      chatId: new mongo.ObjectId(chatId),
      sender: new mongo.ObjectId(senderId),
      message,
      isAudio
    });

    const savedChatMessage = await newChatMessage.save();

    return savedChatMessage;
  } catch (error) {
    throw error;
  }
};

export const getChatCompletionWithVectorDB = async (
  chatId: string,
  recipientUserId: string,
  userPrompt: string) => {
  try {
    // const recipient = await UserProfile.findById(recipientUserId);

    // if (!recipient) {
    //   throw "Invalid repicipient user id.";
    // }

    // const messageId = new mongo.ObjectId();

    // const result = await axios.post(`${whisperinChatServiceURL}/chat`, {
    //   serviceId: "emb-qry-chat",
    //   chatId,
    //   recipientUserId,
    //   messageId,
    //   userPrompt,
    //   systemPrompt: await recipient.characterPrompt
    // });

    // return {
    //   messageId,
    //   message: result.data
    // };
  } catch (error) {
    throw error;
  }
}

