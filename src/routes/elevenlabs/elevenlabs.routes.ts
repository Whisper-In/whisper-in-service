import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware";
import { getTextToSpeech } from "../../controllers/elevenlabs/elevenlabs.controller";
import { subscriptionFeaturesMiddleware } from "../../middlewares/text-to-speech-subscription.middleware";
import { TierChatFeature } from "../../models/user/user-profile.model";

const router = express.Router();

router.post("/text-to-speech/:profileId", [
    passportJWTMiddleware,
    subscriptionFeaturesMiddleware([TierChatFeature.AUDIO])
], getTextToSpeech);

export default router;
