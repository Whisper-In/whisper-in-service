import { Schema, model, Types } from "mongoose";
import { UserProfile } from "../user/user-profile.model.js";

interface IChatMessage {
  chatId: Types.ObjectId;
  message: string;
  isAudio?: boolean;
  sender: Types.ObjectId;
  createdAt?: Date,
  updatedAt?: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    chatId: Types.ObjectId,
    message: String,
    isAudio: Boolean,
    sender: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },  
  },
  { timestamps: true }
);

const ChatMessage = model("ChatMessage", ChatMessageSchema);

export { ChatMessage, IChatMessage };
