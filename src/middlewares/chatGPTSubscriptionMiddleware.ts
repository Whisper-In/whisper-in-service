import { RequestHandler } from "express";
import { SubscriptionStatus, UserAISubscription } from "../models/user/user-ai-subscription.model.js";

export const chatGPTSubscriptionMiddleware: RequestHandler = async (req, res, next) => {
    const aiProfileId = req.body.aiProfileId;
    const today = new Date();

    try {
        const user: any = req.user;
        const userId = user["_id"];

        const subscription = await UserAISubscription.exists({ userId, aiProfileId, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] });
        console.log(subscription);

        if (subscription != null) {
            next();
        } else {
            return res.status(200).send({
                message: "Sorry, please subscribe to my profile to chat with me.",
                sender: aiProfileId,
                createdAt: today,
                updatedAt: today,
            });
        }
    } catch (error) {
        return res.status(200).send({
            message: "Sorry. Could you please repeat that?",
            sender: aiProfileId,
            createdAt: today,
            updatedAt: today,
            error
        });        
    }
}