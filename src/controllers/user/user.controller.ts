import { RequestHandler } from "express";
import * as userService from "../../services/user/user.services.js";

export const createUserAISubscription: RequestHandler = async (req, res, next) => {
    const aiProfileId = <string>req.body.aiProfileId;
    const tier = Number.parseInt(<string>req.body.tier ?? 0);
    const subscriptionId = <string>req.body.subscriptionId;
    const user: any = req.user;
    const userId = user["_id"];

    try {
        await userService.createUserAISubscription(userId, aiProfileId, tier, subscriptionId);

        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const getUserProfile: RequestHandler = async (req, res, next) => {
    const user: any = req.user;
    const userId = user["_id"];

    try {
        const result = await userService.getUserProfile(userId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).send({ error });
    }
}