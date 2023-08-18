import { Types, mongo } from "mongoose";
import { Post, PostType } from "../../models/content/post.model.js"
import { UserLikedPost } from "../../models/content/user-liked-post.model.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";

export const getRecommendedPosts = async (userId: string, size: number, showFollowingOnly?: boolean) => {
    try {
        const following = await UserAISubscription.find({
            userId,
            status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
        }).select({
            aiProfileId: true
        }).transform((results) => results.map(r => r.aiProfileId));

        const results = await Post.aggregate([
            {
                $match: showFollowingOnly ? {
                    creator: { $in: following }
                } : {}
            },
            {
                $lookup: {
                    from: `${UserLikedPost.modelName}s`.toLowerCase(),
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
            {
                $project: {
                    postURL: 1,
                    postType: 1,
                    description: 1,
                    creator: 1,
                    creatorModel: 1,
                    likeCount: { $size: "$likes" },
                    isLiked: { $in: [userId, "$likes.userId"] }
                }
            },
            { $sample: { size } }
        ]);

        await Post.populate(results, {
            path: "creator",
            select: {
                _id: true,
                userName: true,
                avatar: true,
                isFollowing: { $in: ["$_id", following] }
            },
        });

        return results;
    } catch (error) {
        throw error;
    }
}

export const getExplorePosts = async (size: number) => {
    try {
        const randomPostIds = await Post.aggregate().project({ _id: true }).sample(size);

        const results = await Post.find({
            _id: { $in: randomPostIds.map(p => p._id) }
        }).populate({
            path: "creator.profile",
            select: {
                _id: true,
                userName: true,
                avatar: true
            }
        });

        return results;
    } catch (error) {
        throw error;
    }
}

export const getPosts = async (userId: string, profileId: string, postType: string, pageIndex: number, itemsPerLoad: number) => {
    try {
        const isFollowing = await UserAISubscription.exists({
            userId,
            aiProfileId: profileId,
            status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
        });

        const results = await Post.aggregate([
            {
                $match: {
                    creator: new Types.ObjectId(profileId),
                    postType
                }
            },
            {
                $lookup: {
                    from: `${UserLikedPost.modelName}s`.toLowerCase(),
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
            {
                $project: {
                    postURL: 1,
                    postType: 1,
                    description: 1,
                    creator: 1,
                    creatorModel: 1,
                    thumbnailURL: 1,
                    likeCount: { $size: "$likes" },
                    isLiked: { $in: [userId, "$likes.userId"] }
                }
            },
            {
                $skip: pageIndex * itemsPerLoad
            },
            {
                $limit: itemsPerLoad
            }
        ]);

        await Post.populate(results, {
            path: "creator",
            select: {
                _id: true,
                userName: true,
                avatar: true,
                isFollowing: { $eq: [true, isFollowing != null] }
            },
        });

        return results;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const createPost = async (userId: string, description: string, file: Express.Multer.File) => {
    try {
        const userProfile = await UserProfile.findById(userId);

        if (!userProfile?.linkedAIProfile) {
            throw "User is not linked to an AI profile."
        }

        const newPost = new Post({
            creator: userProfile.linkedAIProfile,
            description,
            postType: PostType[file.mimetype.includes("video") ? PostType.VIDEO : PostType.PHOTO],
            postURL: file.path
        });

        return await newPost.save();
    } catch (error) {
        throw error;
    }
}

export const likePost = async (userId: string, postId: string) => {
    try {
        const isLiked = await UserLikedPost.exists({ userId, postId });

        if (!isLiked) {
            await new UserLikedPost({
                userId,
                postId
            }).save();
        } else {
            await UserLikedPost.deleteOne({
                userId,
                postId
            });
        }

        const likeCount = await UserLikedPost.count({ postId });

        return { isLiked: !isLiked, likeCount };
    } catch (error) {
        throw error;
    }
}