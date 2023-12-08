import { Types, mongo } from "mongoose";
import { IProfileDto } from "../../dtos/profile/profile.dtos.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
import { Chat } from "../../models/chat/chat.model.js";
import { isFulfilled } from "../../utils/promise.js";
import { Post } from "../../models/content/post.model.js";
import { UserLikedPost } from "../../models/content/user-liked-post.model.js";
import { BusinessConfig } from "../../models/business/business-configs.model.js";
import { UserFollowing } from "../../models/user/user-following.model.js";

export const getProfile = async (queryUserId: string, userId: string) => {
    try {
        let result: IProfileDto | undefined = undefined;
        const userObjectId = new mongo.ObjectId(userId);
        const queryUserObjectId = new mongo.ObjectId(queryUserId);

        const minSubscriptionFeeQuery = await BusinessConfig.findOne({ configName: "MIN_SUBSCRIPTION_FEE" });

        const rawResult = await UserProfile.findById(queryUserId);

        if (rawResult) {
            let today = new Date();

            const isSubscribed = await UserSubscription.exists({
                $and: [
                    { subscribedUserId: queryUserId },
                    { userId },
                    { status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] },
                    { $or: [{ expiryDate: { $gte: today } }, { expiryDate: { $exists: false } }] }
                ]
            });

            const isFollowing = await UserFollowing.exists({
                userId,
                followedUserId: queryUserId
            });

            const isBlocked = await Chat.exists({
                'profiles.profile': {
                    $all: [userObjectId, queryUserObjectId],
                },
                profiles: {
                    $elemMatch: { profile: queryUserObjectId, blocked: true }
                }
            });

            const followerCount = await UserFollowing.count({ followedUserId: queryUserId });

            const postCounts = await Post.aggregate([
                {
                    $match: { creator: queryUserObjectId }
                },
                {
                    $lookup: {
                        from: `${UserLikedPost.modelName}s`.toLowerCase(),
                        foreignField: "postId",
                        localField: "_id",
                        as: "likes"
                    }
                },
                {
                    $project: {
                        likes: { $size: "$likes" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        postCount: { $count: {} },
                        likeCount: { $sum: "$likes" },
                    }
                }
            ]).then(items => items[0]);

            const chat = await Chat.findOne({
                "profiles.profile": {
                    $all: [userObjectId, queryUserObjectId]
                }
            })

            const minSubscriptionFee = Number.parseFloat(minSubscriptionFeeQuery?.configValue ?? "0");
            rawResult.priceTiers.forEach((priceTier) => priceTier.price = Math.max(priceTier.price, minSubscriptionFee));

            result = {
                id: rawResult.id,
                chatId: chat?.id,
                name: rawResult.name,
                avatar: rawResult.avatar,
                userName: rawResult.userName,
                bio: rawResult.bio,
                priceTiers: rawResult.priceTiers,
                isSubscriptionOn: rawResult.isSubscriptionOn,
                isSubscribed: isSubscribed?._id != null,
                isFollowing: isFollowing?._id != null,
                isBlocked: isBlocked?._id != null,
                followerCount,
                postCount: postCounts?.postCount,
                totalLikeCount: postCounts?.likeCount,
                isMe: userId == queryUserId
            }
        }

        return result;
    } catch (error) {
        throw error;
    }
}

export const searchProfiles = async (query: string) => {
    if (!query) {
        return []
    }

    const regex = new RegExp(query, "i");

    try {
        const profiles = await UserProfile.find({ userName: regex });

        const results = profiles.map<IProfileDto>((profile) => ({
            id: profile.id,
            name: profile.name,
            userName: profile.userName,
            avatar: profile.avatar,
            priceTiers: profile.priceTiers
        }));

        return results;
    } catch (error) {
        throw error;
    }
}