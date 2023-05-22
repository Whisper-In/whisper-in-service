import { Schema, model, Types } from "mongoose";
import { AIProfile } from "../ai/ai-profile.model.js";
import { UserProfile } from "../user/user-profile.model.js";

interface IChatMessage {
  chat: Types.ObjectId;
  message: string;
  sender: Types.ObjectId;
  senderModel: string;  
  createdAt?: Date,
  updatedAt?: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    message: String,
    sender: { type: Schema.Types.ObjectId, refPath: "senderModel" },    
    senderModel: { type: String, enum: [UserProfile.modelName, AIProfile.modelName], },
  },
  { timestamps: true }
);

const ChatMessage = model("ChatMessage", ChatMessageSchema);

export { ChatMessage, IChatMessage };
