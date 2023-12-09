import { RequestHandler } from "express";
import * as elevenLabsService from "../../services/elevenlabs/elevenlabs.services";
import { UserProfile } from "../../models/user/user-profile.model";
export const getTextToSpeech: RequestHandler = async (req, res, next) => {
    try {
        const profileId = req.params.profileId;
        const text: string = req.body.text;

        if (!text?.length) {
            throw "Text input required.";
        }

        const profile = await UserProfile.findById(profileId);

        if (!profile) {
            return res.status(404).json({ error: "Profile not found." });
        }

        const voiceId = profile.voiceId;

        const result = await elevenLabsService.getTextToSpeech(text, voiceId);

        res.attachment("sample.mp3").send(result.data);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}