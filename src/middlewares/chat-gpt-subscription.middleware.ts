import { RequestHandler } from "express";
import { SubscriptionStatus, UserSubscription } from "../models/user/user-subscriptions.model.js";

export const chatGPTSubscriptionMiddleware: RequestHandler = async (req, res, next) => {
    const subscribedUserId = req.body.profileId;
    const today = new Date();

    try {
        const user: any = req.user;
        const userId = user["_id"];

        const subscription = await UserSubscription.exists({ userId, subscribedUserId, status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] });        

        if (subscription != null) {
            return next();
        } else {
            return res.status(200).send({
                message: "Sorry, please subscribe to my profile to chat with me.",
                sender: subscribedUserId,
                createdAt: today,
                updatedAt: today,
            });
        }
    } catch (error) {
        return res.status(200).send({
            message: "Sorry. Could you please repeat that?",
            sender: subscribedUserId,
            createdAt: today,
            updatedAt: today,
            error
        });        
    }
}