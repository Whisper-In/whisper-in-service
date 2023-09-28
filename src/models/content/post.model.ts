import { ObjectId, Schema, model } from "mongoose";
import { UserProfile } from "../user/user-profile.model.js";

export enum PostType {
  VIDEO, PHOTO
}

interface IPost {
  postURL: string;
  thumbnailURL: string;
  postType: string;
  description: string;
  creator: ObjectId;
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
});

const Post = model("Post", PostSchema);

export { Post };