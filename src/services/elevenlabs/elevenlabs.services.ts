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

const axiosInstance = axios.create({
    baseURL: elevenLabsBaseURL,
    headers: {
        'xi-api-key': elevenLabsAPIKey
    }
});

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
                    'Content-Type': 'application/json'
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
                    accept: 'audio/mpeg'
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

export const createVoice = async (name: string, files: { fileName: string, blob: Blob }[]) => {
    try {
        const formData = new FormData();
        formData.append("name", name);

        files.forEach(file => formData.append("files", file.blob, file.fileName ?? "voice-sample"));

        const result = await axiosInstance.post('voices/add',
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

        return result.data as { voice_id: string }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteVoice = async (voiceId: string) => {
    try {
        const result = await axiosInstance.delete(`voices/${voiceId}`);

        return result.data;
    } catch (error) {
        throw error;
    }
}