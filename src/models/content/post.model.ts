import { ObjectId, Schema, model } from "mongoose";
import { UserProfile } from "../user/user-profile.model.js";
import { AIProfile } from "../ai/ai-profile.model.js";

export enum PostType {
  VIDEO, PHOTO
}

export interface ICreatorProfile {
  profile: ObjectId;
  profileModel: any;
}

interface IPost {
  postURL: string;
  thumbnailURL: string;
  postType: string;
  description: string;
  creator: ObjectId;
  creatorModel: string;
}

const PostSchema = new Schema<IPost>({
  postURL: String,
  thumbnailURL: String,
  postType: String,
  description: String,
  creator: {
    type: Schema.Types.ObjectId,
    refPath: "creatorModel",
  },
  creatorModel: {
    type: String,
    enum: [UserProfile.modelName, AIProfile.modelName]
  }
});

const Post = model("Post", PostSchema);

export { Post };