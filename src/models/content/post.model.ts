import { ObjectId, Schema, model } from "mongoose";
import { UserProfile } from "../user/user-profile.model";

export enum PostType {
  VIDEO, PHOTO
}

export interface IPost {
  postURL: string;
  thumbnailURL: string;
  postType: string;
  description?: string;
  creator: ObjectId;
  createdAt?: string;
  updatedAt?: string;
}

const PostSchema = new Schema<IPost>({
  postURL: String,
  thumbnailURL: String,
  postType: String,
  description: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: UserProfile.modelName,
  }
}, { timestamps: true });

const Post = model("Post", PostSchema);

export { Post };