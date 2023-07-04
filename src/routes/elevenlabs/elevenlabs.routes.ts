import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import { getTextToSpeech } from "../../controllers/elevenlabs/elevenlabs.controller.js";

const router = express.Router();

router.post("/text-to-speech/:aiProfileId", passportJWTMiddleware, getTextToSpeech);

export default router;
