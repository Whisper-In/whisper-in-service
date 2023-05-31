import { Schema, model, Model, ObjectId } from "mongoose";
import jwt from "jsonwebtoken";

const jwtSecret = <string>process.env.JWT_SECRET;

export interface IUserProfile {
  _id: ObjectId;
  name: string;  
  birthday: Date;
  gender: string;
  avatar?: string;
  email: string;
  googleId: string;
}

export interface IUserProfileMethods {
  generateJWT(): string;
}

export type UserProfileModel = Model<IUserProfile, {}, IUserProfileMethods>;

export const UserProfileSchema = new Schema<IUserProfile, UserProfileModel, IUserProfileMethods>(
  {
    name: String,
    birthday: Date,
    gender: String,
    avatar: { type: String, required: false },
    email: String,
    googleId: String
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
