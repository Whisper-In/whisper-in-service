import { RequestHandler } from "express";
import { AIProfile, TierChatFeature } from "../models/ai/ai-profile.model.js";
import { UserAISubscription } from "../models/user/user-ai-subscription.model.js";
import { isFulfilled } from "../utils/promise.js";

export const subscriptionFeaturesMiddleware = (features: TierChatFeature[]): RequestHandler => {
    return async (req, res, next) => {
        try {
            const user: any = req.user;
            const userId = user["_id"];
            const { aiProfileId } = req.params;

            const queries = await Promise.allSettled([
                UserAISubscription.findOne({ userId, aiProfileId }),
                AIProfile.findById(aiProfileId)
            ]);

            if (isFulfilled(queries[0]) && isFulfilled(queries[1])) {
                const userAISubscription = queries[0].value;
                const aiProfile = queries[1].value;

                if (userAISubscription && aiProfile) {
                    const priceTier = aiProfile.priceTiers.find((priceTier) => priceTier.tier == userAISubscription.tier);
                    
                    if (priceTier?.features?.length &&
                        priceTier?.features.every((f) => features.includes(TierChatFeature[f as keyof typeof TierChatFeature]))) {
                        return next();
                    }
                }
            }

            return res.status(403).end();
        } catch (error) {
            return res.status(400).send({ error: "Failed to verify text-to-speech subscription." });
        }
    }
}