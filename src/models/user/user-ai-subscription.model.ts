import { Schema, Types, model } from "mongoose";
import { AIProfile } from "../ai/ai-profile.model.js";
import { UserProfile } from "./user-profile.model.js";

export enum SubscriptionStatus {
    PENDING,
    SUCCEEDED,
    FAILED
}

export interface IUserAISubscription {
    userId: Types.ObjectId;
    aiProfileId: Types.ObjectId;
    tier: number;
    expiryDate?: Date;
    status: string;
}

const UserAISubscriptionSchema = new Schema<IUserAISubscription>({
    userId: { type: Schema.Types.ObjectId, refPath: UserProfile.modelName },
    aiProfileId: { type: Schema.Types.ObjectId, refPath: AIProfile.modelName },
    tier: Number,
    status: String,
    expiryDate: { type: Date, required: false }
});

const UserAISubscription = model("UserAiSubscription", UserAISubscriptionSchema);

export { UserAISubscription };