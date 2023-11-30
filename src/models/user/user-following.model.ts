import { Schema, Types, model } from "mongoose";
import { UserProfile } from "./user-profile.model.js";

export interface IUserFollowing {
    userId: Types.ObjectId;
    followedUserId: Types.ObjectId;
}

const UserFollowingSchema = new Schema<IUserFollowing>(
    {
        userId: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },
        followedUserId: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },
    },
    { timestamps: true });

const UserFollowing = model("UserFollowing", UserFollowingSchema);

export { UserFollowing };