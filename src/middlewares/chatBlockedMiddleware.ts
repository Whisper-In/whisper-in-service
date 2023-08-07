import { Types, mongo } from "mongoose";
import { RequestHandler } from "express";
import { Chat } from "../models/chat/chat.model.js";

export const chatBlockedMiddleware: RequestHandler = async (req, res, next) => {
    const aiProfileId = req.body.aiProfileId;
    const user: any = req.user;
    const userId = user["_id"];

    try {
        const userObjectId = new mongo.ObjectId(userId);
        const aiProfileObjectId = new mongo.ObjectId(aiProfileId);

        const isBlocked = await Chat.exists({
            'profiles.profile': {
                $all: [userObjectId, aiProfileObjectId],
            },
            profiles: {
                $elemMatch: { profile: aiProfileId, blocked: true }
            }
        });


        if (isBlocked == null) {
            return next();
        } else {
            throw "Profile is blocked!";
        }
    } catch (error) {
        return res.status(403).send(error);
    }
}