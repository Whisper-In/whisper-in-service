import { Schema, model, Types } from "mongoose";
import { AIProfile } from "../ai/ai-profile.model.js";
import { UserProfile } from "../user/user-profile.model.js";

export interface IChatProfile {
  profile: Types.ObjectId;
  profileModel: any;
  blocked?: boolean
}

export interface IChat {
  profiles: IChatProfile[];
  createdAt?: Date;
  updatedAt?: Date;
}

const profileModel = {
  type: String,
  enum: [UserProfile.modelName, AIProfile.modelName],
};

const ChatProfileSchema = new Schema<IChatProfile>({
  profile: {
    type: Schema.Types.ObjectId,
    refPath: "profiles.profileModel",
  },
  profileModel,
  blocked: Boolean
});

const ChatSchema = new Schema<IChat>(
  {
    profiles: { type: [ChatProfileSchema] },
  },
  { timestamps: true }
);

// ChatSchema.virtual("lastChatMessage", {
//   ref: ChatMessage,
//   localField: "_id",
//   foreignField: "chat",
//   justOne: true,
//   options: {
//     sort: {createdAt: -1}
//   }
// });

const Chat = model("Chat", ChatSchema);

export { Chat };
