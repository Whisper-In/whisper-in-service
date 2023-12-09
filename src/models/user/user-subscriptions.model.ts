import { Schema, Types, model } from "mongoose";
import { UserProfile } from "./user-profile.model";

export enum SubscriptionStatus {
    PENDING,
    SUCCEEDED,
    FAILED,
    DELETED
}

export interface IUserSubscription {
    userId: Types.ObjectId;
    subscribedUserId: Types.ObjectId;
    tier: number;
    stripeSubscriptionId?: string;
    status: string;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },
        subscribedUserId: { type: Schema.Types.ObjectId, ref: UserProfile.modelName },
        tier: Number,
        status: String,
        stripeSubscriptionId: { type: String, required: false }
    },
    { timestamps: true });

const UserSubscription = model("UserSubscription", UserSubscriptionSchema);

export { UserSubscription };