import { Types, mongo } from "mongoose";
import { IProfileDto } from "../../dtos/profile/profile.dtos.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";
import { Chat } from "../../models/chat/chat.model.js";
import { isFulfilled } from "../../utils/promise.js";

export const getProfile = async (aiProfileId: string, userId: string, isAI: boolean) => {
    try {
        let result: IProfileDto | undefined = undefined;
        const userObjectId = new mongo.ObjectId(userId);
        const aiProfileObjectId = new mongo.ObjectId(aiProfileId);

        if (isAI) {
            const rawResult = await AIProfile.findById(aiProfileId);

            if (rawResult) {
                let today = new Date();

                const subscriptionQuery = UserAISubscription.exists({
                    $and: [
                        { aiProfileId },
                        { userId },
                        { status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] },
                        { $or: [{ expiryDate: { $gte: today } }, { expiryDate: { $exists: false } }] }
                    ]
                });

                const isBlockedQuery = Chat.exists({
                    'profiles.profile': {
                        $all: [userObjectId, aiProfileObjectId],
                    },
                    profiles: {
                        $elemMatch: { profile: aiProfileId, blocked: true }
                    }
                });

                const promiseResults = await Promise.allSettled([subscriptionQuery, isBlockedQuery]);

                const isSubscribed = isFulfilled(promiseResults[0]) ? promiseResults[0].value != null : false
                const isBlocked = isFulfilled(promiseResults[1]) ? promiseResults[1].value != null : false

                result = {
                    id: rawResult.id,
                    name: rawResult.name,
                    avatar: rawResult.avatar,
                    userName: rawResult.userName,
                    aboutMe: rawResult.aboutMe,
                    priceTiers: rawResult.priceTiers,
                    isSubscribed,
                    isBlocked
                }
            }
        } else {
            const rawResult = await UserProfile.findById(new Types.ObjectId(aiProfileId));

            if (rawResult) {
                result = {
                    id: rawResult.id,
                    name: rawResult.name,
                    avatar: rawResult.avatar,
                    userName: rawResult.userName,
                    aboutMe: rawResult.aboutMe
                }
            }
        }

        return result;
    } catch (error) {
        throw error;
    }
}

export const searchProfiles = async (query: string) => {
    const regex = new RegExp(query, "i");

    try {
        const profiles = await AIProfile.find({ userName: regex });

        const results = profiles.map<IProfileDto>((profile) => ({
            id: profile._id,
            name: profile.name,
            userName: profile.userName,
            avatar: profile.avatar,
            priceTiers: profile.priceTiers
        }));

        return results;
    } catch (error) {

    }
}