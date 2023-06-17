import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";

export const createUserAISubscription = async (userId: string, aiProfileId: string, tier: number) => {
    try {        
        const existingSubscription = await UserAISubscription.exists({ userId, aiProfileId });

        if (existingSubscription) {
            UserAISubscription.findOneAndUpdate({ userId, aiProfileId }, { tier });
        } else {
            const aiProfile = await AIProfile.findById(aiProfileId);
            
            if (aiProfile) {
                const priceTier = aiProfile.priceTiers.find(p => p.tier == tier);

                if (priceTier) {
                    const today = new Date();

                    const newSubscription = new UserAISubscription({
                        aiProfileId,
                        userId,
                        tier,
                        status: SubscriptionStatus.PENDING.toString(),
                        expiryDate: new Date(today.setFullYear(today.getFullYear() + 1))
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
        await UserAISubscription.findOneAndUpdate({ aiProfileId, userId }, { status: status.toString() });
    } catch (error) {
        throw error;
    }
}