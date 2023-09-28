import { Schema, model, Types } from "mongoose";
import { UserProfile } from "../user/user-profile.model.js";

interface IChatMessage {
  chat: Types.ObjectId;
  message: string;
  isAudio?: boolean;
  audioId?: number;
  sender: Types.ObjectId;
  createdAt?: Date,
  updatedAt?: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    message: String,
    sender: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },
  },
  { timestamps: true }
);

const ChatMessage = model("ChatMessage", ChatMessageSchema);

export { ChatMessage, IChatMessage };
