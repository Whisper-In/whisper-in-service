import axios from "axios";
import { elevenLabsAPIKey, elevenLabsBaseURL } from "../../config/app.config.js";
import fs from "fs";
import { Stream } from "stream";

const defaultVoiceSettings = {
    stability: 1,
    similarity_boost: 1
}

const defaultOptimizeStreamingLatency = 1;

const defaultModelId = "eleven_multilingual_v1";

const axiosInstance = axios.create({ baseURL: elevenLabsBaseURL });

const defaultVoiceId = "21m00Tcm4TlvDq8ikWAM";

export const getTextToSpeech = async (text: string, voiceId?: string) => {
    try {
        const result = await axiosInstance.post<Buffer>(`text-to-speech/${voiceId ?? defaultVoiceId}`,
            {
                text,
                model_id: defaultModelId,
                voice_settings: defaultVoiceSettings
            },
            {
                headers: {
                    Accept: 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': elevenLabsAPIKey,
                },
                params: {
                    optimize_streaming_latency: defaultOptimizeStreamingLatency
                },
                responseType: "arraybuffer"
            });
        
        return result;
    } catch (error) {
        throw error;
    }
}

export const getTextToSpeechStream = async (text: string, voiceId?: string) => {
    try {
        const result = await axiosInstance.post<Stream>(`text-to-speech/${voiceId ?? defaultVoiceId}/stream`,
            {
                text,
                model_id: defaultModelId,
                voice_settings: defaultVoiceSettings
            },
            {
                headers: {
                    accept: 'audio/mpeg',
                    'xi-api-key': elevenLabsAPIKey,
                },
                params: {
                    optimize_streaming_latency: defaultOptimizeStreamingLatency
                },
                responseType: "stream"
            });

        return result;
    } catch (error) {
        throw error;
    }
}