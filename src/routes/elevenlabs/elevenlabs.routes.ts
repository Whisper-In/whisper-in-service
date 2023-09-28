import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";
import { getTextToSpeech } from "../../controllers/elevenlabs/elevenlabs.controller.js";
import { subscriptionFeaturesMiddleware } from "../../middlewares/text-to-speech-subscription.middleware.js";
import { TierChatFeature } from "../../models/user/user-profile.model.js";

const router = express.Router();

router.post("/text-to-speech/:profileId", [
    passportJWTMiddleware,
    subscriptionFeaturesMiddleware([TierChatFeature.AUDIO])
], getTextToSpeech);

export default router;
