import { RequestHandler } from "express";
import * as elevenLabsService from "../../services/elevenlabs/elevenlabs.services.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";

export const getTextToSpeech: RequestHandler = async (req, res, next) => {
    try {
        const aiProfileId = req.params.aiProfileId;
        const text: string = req.body.text;

        if (!text?.length) {
            throw "Text input required.";
        }

        const aiProfile = await AIProfile.findById(aiProfileId);

        if (!aiProfile) {
            return res.status(404).json({ error: "AI Profile not found." });
        }

        const voiceId = aiProfile.voiceId;

        const result = await elevenLabsService.getTextToSpeech(text, voiceId);

        res.attachment("sample.mp3").send(result.data);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}