import { RequestHandler } from "express";
import { SubscriptionStatus, UserSubscription } from "../models/user/user-subscriptions.model";
import { insertNewChatMessage } from "../services/chat/chat.services";
import { ERROR_MESSAGE, SUBSCRIPTION_PROMPT } from "../config/chatgpt.config";

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
            replyMessage = SUBSCRIPTION_PROMPT;
        }
    } catch (error) {
        replyMessage = ERROR_MESSAGE;
    }

    const result = await insertNewChatMessage(chatId, subscribedUserId, replyMessage);

    return res.status(200).json(result);
}