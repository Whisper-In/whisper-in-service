import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { openAIApiKey } from "../../config/app.config.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { ChatMessage } from "../../models/chat/chat-message.model.js";
import { mongo } from "mongoose";
import { isFulfilled } from "../../utils/promise.js";
import { query } from "express";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { CHAT_COMPLETION_TEMP } from "../../config/chatgpt.config.js";

const configuration = new Configuration({
  apiKey: openAIApiKey,
});

const openai = new OpenAIApi(configuration);

export const getChatCompletion = async (
  aiProfileId: string,
  message: string,
  prevMessages: ChatCompletionRequestMessage[] = []
) => {
  try {
    const aiProfile = await AIProfile.findOne({ _id: aiProfileId });

    if (!aiProfile) {
      throw "AI profile id provided does not exists.";
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: "user",
          content: aiProfile.characterPrompt,
        },
        ...prevMessages,        
        {
          role: "user",
          content: `${message}. (Stay in character).`,
        },
      ],
      temperature: CHAT_COMPLETION_TEMP,
    });

    return completion.data.choices[0].message;
  } catch (error: any) {
    throw error.message;
  }
};
