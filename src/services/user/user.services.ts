import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";

export const createUserAISubscription = async (userId: string, aiProfileId: string, tier: number, stripeSubscriptionId: string) => {
    try {
        let status = SubscriptionStatus[stripeSubscriptionId ? SubscriptionStatus.PENDING : SubscriptionStatus.SUCCEEDED];

        const existingSubscription = await UserAISubscription.exists({ userId, aiProfileId });

        if (existingSubscription) {
            UserAISubscription.findOneAndUpdate(
                {
                    userId,
                    aiProfileId
                },
                {
                    tier,
                    stripeSubscriptionId,
                    status
                }).exec();
        } else {
            const aiProfile = await AIProfile.findById(aiProfileId);

            if (aiProfile) {
                const priceTier = aiProfile.priceTiers.find(p => p.tier == tier);                

                if (priceTier) {
                    if(priceTier.price > 0 && !stripeSubscriptionId) {
                        throw "No payment found.";
                    }

                    const today = new Date();

                    const newSubscription = new UserAISubscription({
                        aiProfileId,
                        userId,
                        tier,
                        status,
                        expiryDate: new Date(today.setFullYear(today.getFullYear() + 1)),
                        stripeSubscriptionId
                    });

                    newSubscription.save();
                }
                else {
                }
            } else {
                throw "Invalid profile id provided."
            }
        }
    } catch (error) {
        throw error;
    }
}

export const updateUserAISubscription = async (userId: string, aiProfileId: string, status: SubscriptionStatus) => {
    try {
        await UserAISubscription.findOneAndUpdate({ aiProfileId, userId }, { status: SubscriptionStatus[status] });
    } catch (error) {
        throw error;
    }
}

export const getUserProfile = async (userId: string) => {
    try {
        const result = await UserProfile.findById(userId);

        return result;
    } catch (error) {
        throw error;
    }
}