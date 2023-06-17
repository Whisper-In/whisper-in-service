import { RequestHandler } from "express";
import * as userService from "../../services/user/user.services.js";

export const createUserAISubscription: RequestHandler = async (req, res, next) => {
    const aiProfileId = <string>req.body.aiProfileId;
    const tier = Number.parseInt(<string>req.body.tier);
    const user: any = req.user;
    const userId = user["_id"];

    try {
        await userService.createUserAISubscription(userId, aiProfileId, tier);

        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error });
    }
}