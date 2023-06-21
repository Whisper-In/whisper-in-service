import { Types } from "mongoose";

export interface IProfileTierDto {
    tier: number;
    price: number;
}

export interface IProfileDto {
    id: string;
    name: string;
    aboutMe?:string;
    email?: string;
    userName: string;
    avatar?: string;
    priceTiers?: IProfileTierDto[];
    isSubscribed?: boolean;
    isSubscriptionExpired?: boolean;
}