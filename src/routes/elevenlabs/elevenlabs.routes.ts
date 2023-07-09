import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { getTextToSpeech } from "../../controllers/elevenlabs/elevenlabs.controller.js";
import { subscriptionFeaturesMiddleware } from "../../middlewares/textToSpeechSubscriptionMiddleware.js";
import { TierChatFeature } from "../../models/ai/ai-profile.model.js";

const router = express.Router();

router.post("/text-to-speech/:aiProfileId", [
    passportJWTMiddleware,
    subscriptionFeaturesMiddleware([TierChatFeature.AUDIO])
], getTextToSpeech);

export default router;
