import { Types, mongo } from "mongoose";
import { IProfileDto } from "../../dtos/profile/profile.dtos.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
import { Chat } from "../../models/chat/chat.model.js";
import { isFulfilled } from "../../utils/promise.js";
import { Post } from "../../models/content/post.model.js";
import { UserLikedPost } from "../../models/content/user-liked-post.model.js";
import { BusinessConfig } from "../../models/business/business-configs.model.js";

export const getProfile = async (queryUserId: string, userId: string) => {
    try {
        let result: IProfileDto | undefined = undefined;
        const userObjectId = new mongo.ObjectId(userId);
        const queryUserObjectId = new mongo.ObjectId(queryUserId);

        const minSubscriptionFeeQuery = await BusinessConfig.findOne({ configName: "MIN_SUBSCRIPTION_FEE" });

        const rawResult = await UserProfile.findById(queryUserId);

        if (rawResult) {
            let today = new Date();

            const subscriptionQuery = UserSubscription.exists({
                $and: [
                    { subscribedUserId: queryUserId },
                    { userId },
                    { status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED] },
                    { $or: [{ expiryDate: { $gte: today } }, { expiryDate: { $exists: false } }] }
                ]
            });

            const isBlockedQuery = Chat.exists({
                'profiles.profile': {
                    $all: [userObjectId, queryUserObjectId],
                },
                profiles: {
                    $elemMatch: { profile: queryUserObjectId, blocked: true }
                }
            });

            const followerCountQuery = UserSubscription.count({
                $and: [{
                    queryUserId,
                    status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
                },
                { $or: [{ expiryDate: { $gte: today } }, { expiryDate: { $exists: false } }] }]
            });

            const postCountsQuery = Post.aggregate([
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

            const promiseResults = await Promise.allSettled([
                subscriptionQuery,
                isBlockedQuery,
                followerCountQuery,
                postCountsQuery
            ]);

            const isSubscribed = isFulfilled(promiseResults[0]) ? promiseResults[0].value != null : false;
            const isBlocked = isFulfilled(promiseResults[1]) ? promiseResults[1].value != null : false;
            const followerCount = isFulfilled(promiseResults[2]) ? promiseResults[2].value : 0;
            const postCounts = isFulfilled(promiseResults[3]) ? promiseResults[3].value : null;

            const minSubscriptionFee = Number.parseFloat(minSubscriptionFeeQuery?.configValue ?? "0");
            rawResult.priceTiers.forEach((priceTier) => priceTier.price = Math.max(priceTier.price, minSubscriptionFee));

            result = {
                id: rawResult.id,
                name: rawResult.name,
                avatar: rawResult.avatar,
                userName: rawResult.userName,
                bio: rawResult.bio,
                priceTiers: rawResult.priceTiers,
                isSubscriptionOn: rawResult.isSubscriptionOn,
                isSubscribed,
                isBlocked,
                followerCount,
                postCount: postCounts?.postCount,
                totalLikeCount: postCounts?.likeCount
            }
        }

        return result;
    } catch (error) {
        throw error;
    }
}

export const searchProfiles = async (query: string) => {
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

    }
}