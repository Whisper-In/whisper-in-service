import { RequestHandler } from "express";
import { SubscriptionStatus, UserSubscription } from "../models/user/user-subscriptions.model.js";
import { isFulfilled } from "../utils/promise.js";
import { TierChatFeature, UserProfile } from "../models/user/user-profile.model.js";

export const subscriptionFeaturesMiddleware = (features: TierChatFeature[]): RequestHandler => {
    return async (req, res, next) => {
        try {
            const user: any = req.user;
            const userId = user["_id"];
            const { profileId } = req.params;            

            const queries = await Promise.allSettled([
                UserSubscription.findOne({ userId, subscribedUserId: profileId, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] }),
                UserProfile.findById(profileId)
            ]);

            if (isFulfilled(queries[0]) && isFulfilled(queries[1])) {
                const userSubscription = queries[0].value;
                const subscribedUserProfile = queries[1].value;

                if (userSubscription && subscribedUserProfile) {
                    const priceTier = subscribedUserProfile.priceTiers.find((priceTier) => priceTier.tier == userSubscription.tier);

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