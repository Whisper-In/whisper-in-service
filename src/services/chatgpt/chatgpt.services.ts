import OpenAI from "openai";
import { openAIApiKey } from "../../config/app.config";
import { CHAT_COMPLETION_TEMP } from "../../config/chatgpt.config";
import { UserProfile } from "../../models/user/user-profile.model";

const openai = new OpenAI();

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

    const characterPrompt = await profile.characterPrompt

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
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
