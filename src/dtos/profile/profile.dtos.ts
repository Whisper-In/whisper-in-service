import { Types } from "mongoose";

export interface IProfileTierDto {
    tier: number;
    price: number;
}

export interface IProfileDto {
    id: string;
    chatId?: string;
    name: string;
    bio?: string;
    email?: string;
    userName: string;
    avatar?: string;
    priceTiers?: IProfileTierDto[];
    isSubscriptionOn?: boolean;
    isSubscribed?: boolean;
    isFollowing?: boolean;
    isSubscriptionExpired?: boolean;
    isBlocked?: boolean;
    postCount?: number;
    followerCount?: number;
    totalLikeCount?: number;
    isMe?: boolean;
}