import { Schema, model, Model, ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/app.config.js";
import { BusinessConfig } from "../business/business-configs.model.js";

const namePlaceholder = "{{assistantName}}";
const descriptionPlaceholder = "{{description}}";

export enum TierChatFeature {
  AUDIO
}

interface IPriceTier {
  tier: number;
  price: number;
  features: string[]
}

export interface IUserProfile {
  _id: ObjectId;
  name: string;
  userName: string;
  bio?: string;
  birthday: Date;
  gender: string;
  avatar?: string;
  email: string;
  instagram?: string;
  youtube?: string
  googleId?: string;
  appleId?: string;
  stripeId?: string;
  isAgreeTnC: boolean;
  aiDescription: string;
  characterPrompt: string;
  isDefault: boolean;
  priceTiers: IPriceTier[];
  stripeConnectedAccountId?: string;
  stripeCustomerId?: string;
  voiceSampleURL?: string;
  voiceId?: string;
  isSubscriptionOn?: boolean;
}

export interface IUserProfileMethods {
  generateJWT(): string;
}

const PriceTierSchema = new Schema<IPriceTier>({
  price: Number,
  tier: Number,
  features: [String]
});

export type UserProfileModel = Model<IUserProfile, {}, IUserProfileMethods>;

export const UserProfileSchema = new Schema<IUserProfile, UserProfileModel, IUserProfileMethods>(
  {
    name: { type: String, required: true, maxlength: 64 },
    userName: { type: String, required: true, maxlength: 64 },
    bio: { type: String, maxlength: 150 },
    birthday: Date,
    gender: String,
    avatar: String,
    email: { type: String, required: true, immutable: true },
    instagram: { type: String, maxlength: 128 },
    youtube: { type: String, maxlength: 128 },
    googleId: String,
    appleId: String,
    stripeId: { type: String, maxlength: 255 },
    isAgreeTnC: Boolean,
    isDefault: Boolean,
    aiDescription: String,
    priceTiers: { type: [PriceTierSchema], required: false },
    stripeConnectedAccountId: { type: String, maxlength: 128 },
    stripeCustomerId: { type: String, maxlength: 128 },
    voiceSampleURL: String,
    voiceId: { type: String, maxlength: 128 },
    isSubscriptionOn: Boolean
  },
  { timestamps: true }
);

UserProfileSchema.virtual("characterPrompt").get(async function () {
  const characterPrompt = await BusinessConfig.findOne({ configName: "BASE_CHARACTER_PROMPT" });
  
  return characterPrompt?.configValue
    .replaceAll(namePlaceholder, this.name)
    .replaceAll(descriptionPlaceholder, this.aiDescription);
});

UserProfileSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'creator'
});

UserProfileSchema.methods.generateJWT = function () {
  const token = jwt.sign({
    id: this._id,
    emai: this!.email
  }, jwtSecret)

  return token;
}


const UserProfile = model<IUserProfile, UserProfileModel>("UserProfile", UserProfileSchema);

export { UserProfile };
