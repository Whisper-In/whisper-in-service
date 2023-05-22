import { Schema, model } from "mongoose";

interface IUserProfile {
  name: string;
  avatar?: string;
  email: string;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    name: String,
    avatar: { type: String, required: false },
    email: String,
  },
  { timestamps: true }
);

const UserProfile = model("UserProfile", UserProfileSchema);

export { UserProfile };
