import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { Chat } from "../../models/chat/chat.model.js";

export const get = async (
  profileId: string
) => {
  try {
    const body = await AIProfile.findById(profileId);

    return { success: true, body };
  } catch (error) {
    return { success: false, error };
  }
};