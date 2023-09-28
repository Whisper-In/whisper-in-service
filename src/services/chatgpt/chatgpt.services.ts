import OpenAI from "openai";
import { openAIApiKey } from "../../config/app.config.js";
import { CHAT_COMPLETION_TEMP } from "../../config/chatgpt.config.js";
import { UserProfile } from "../../models/user/user-profile.model.js";

const openai = new OpenAI({
  apiKey: openAIApiKey
});

export const getChatCompletion = async (
  profileId: string,
  message: string,
  prevMessages: OpenAI.Chat.ChatCompletionMessageParam[] = []
) => {
  try {
    const profile = await UserProfile.findOne({ _id: profileId });

    if (!profile) {
      throw "Profile id provided does not exists.";
    }

    const characterPrompt = await profile.characterPrompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: "system",
          content: characterPrompt,
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
