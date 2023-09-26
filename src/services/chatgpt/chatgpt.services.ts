import OpenAI from "openai";
import { openAIApiKey } from "../../config/app.config.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { CHAT_COMPLETION_TEMP } from "../../config/chatgpt.config.js";

const openai = new OpenAI({
  apiKey: openAIApiKey
});

export const getChatCompletion = async (
  aiProfileId: string,
  message: string,
  prevMessages: OpenAI.Chat.ChatCompletionMessageParam[] = []
) => {
  try {
    const aiProfile = await AIProfile.findOne({ _id: aiProfileId });

    if (!aiProfile) {
      throw "AI profile id provided does not exists.";
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-instruct",
      messages: [
        {
          role: "system",
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

    return completion.choices[0].message;
  } catch (error: any) {
    throw error.message;
  }
};
