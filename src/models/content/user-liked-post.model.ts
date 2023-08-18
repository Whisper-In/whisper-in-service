import { ObjectId, Schema, Types, model } from "mongoose";

interface IUserLikedPost {
    userId: ObjectId;
    postId: ObjectId;
}

const UserLikedPostSchema = new Schema<IUserLikedPost>({
    userId: {
        type: Types.ObjectId,
        ref: "UserProfile"
    },
    postId: {
        type: Types.ObjectId,
        ref: "Post"
    }
}, { timestamps: true });

const UserLikedPost = model("UserLikedPost", UserLikedPostSchema);

export { UserLikedPost };