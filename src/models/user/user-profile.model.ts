import { Schema, model, Model, ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/app.config.js";

export interface IUserProfile {
  _id: ObjectId;
  name: string;
  userName: string;
  aboutMe: string;
  birthday: Date;
  gender: string;
  avatar?: string;
  email: string;
  googleId?: string;
  appleId?: string;
  stripeId?: string;
  isAgreeTnC: boolean;
  linkedAIProfile?: ObjectId;
}

export interface IUserProfileMethods {
  generateJWT(): string;
}

export type UserProfileModel = Model<IUserProfile, {}, IUserProfileMethods>;

export const UserProfileSchema = new Schema<IUserProfile, UserProfileModel, IUserProfileMethods>(
  {
    name: String,
    userName: String,
    birthday: Date,
    gender: String,
    avatar: String,
    email: String,
    googleId: String,
    appleId: String,
    stripeId: String,
    isAgreeTnC: Boolean,
    linkedAIProfile: {
      type: Schema.Types.ObjectId,
      ref: "AIProfile"
    }
  },
  { timestamps: true }
);

UserProfileSchema.methods.generateJWT = function () {
  const token = jwt.sign({
    id: this._id,
    emai: this!.email
  }, jwtSecret)

  return token;
}


const UserProfile = model<IUserProfile, UserProfileModel>("UserProfile", UserProfileSchema);

export { UserProfile };
