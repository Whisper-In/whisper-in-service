import { RequestHandler } from "express";
import { SubscriptionStatus, UserSubscription } from "../models/user/user-subscriptions.model.js";
import { insertNewChatMessage } from "../services/chat/chat.services.js";

export const chatGPTSubscriptionMiddleware: RequestHandler = async (req, res, next) => {
    const subscribedUserId = req.body.profileId;
    const chatId = req.body.chatId;

    let replyMessage = "";

    try {
        const user: any = req.user;
        const userId = user["_id"];

        const subscription = await UserSubscription.exists({
            userId,
            subscribedUserId,
            status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
        });
        
        if (subscription != null) {
            return next();
        } else {
            replyMessage = "Sorry, please subscribe to my profile to chat with me.";
        }
    } catch (error) {
        replyMessage = "Sorry. Could you please repeat that?";
    }

    const result = await insertNewChatMessage(chatId, subscribedUserId, replyMessage);

    return res.status(200).json(result);
}