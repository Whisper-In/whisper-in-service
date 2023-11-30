import { Types, mongo } from "mongoose";
import { Post, PostType } from "../../models/content/post.model.js"
import { UserLikedPost } from "../../models/content/user-liked-post.model.js";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
import * as googleCloudService from "../../services/google-cloud/google-cloud.service.js";
import { googleStoragePostsBucketName } from "../../config/app.config.js";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { UserFollowing } from "../../models/user/user-following.model.js";

export const getRecommendedPosts = async (userId: string, size: number, showFollowingOnly?: boolean) => {
    try {
        const following = await UserFollowing.find({
            userId,
        }).select({
            followedUserId: true
        }).transform((results) => results.map(r => r.followedUserId));

        let matchContdition: any = {}

        if (showFollowingOnly) {
            matchContdition.creator = { $in: following }
        }

        const results = await Post.aggregate([
            {
                $match: matchContdition
            },
            {
                $sample: { size }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);

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

export const getPosts = async (
    userId: string, profileId: string, postType: string,
    pageIndex: number, itemsPerLoad: number
) => {
    try {
        const isFollowing = await UserSubscription.exists({
            userId,
            aiProfileId: profileId,
            status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
        });

        const totalPosts = await Post.count({
            creator: profileId,
            postType
        });

        if (Math.ceil(totalPosts / itemsPerLoad) <= pageIndex) {
            return []
        }

        const results = await Post.aggregate([
            {
                $match: {
                    creator: new Types.ObjectId(profileId),
                    postType
                }
            },
            {
                $skip: pageIndex * itemsPerLoad
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
                    isLiked: { $in: [userId, "$likes.userId"] },
                }
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
        const postType = PostType[file.mimetype.includes("video") ? PostType.VIDEO : PostType.PHOTO];

        let thumbnailURL: string | undefined;

        if (postType == PostType[PostType.VIDEO]) {
            const snapshotPath = `${userId}/${Date.now()}_thumbnail`;
            const snapshotFileName = "snapshot.jpg";

            if (!fs.existsSync(snapshotPath)) {
                fs.mkdirSync(snapshotPath, {
                    recursive: true
                });
            }

            const rmSnapshot = () => {
                fs.rmSync(snapshotPath, { recursive: true, force: true });
            }

            const snapshotBuffer = await new Promise<Buffer | null>((resolve, reject) => {
                ffmpeg(file.path).takeScreenshots({
                    count: 1,
                    filename: snapshotFileName,
                    folder: snapshotPath
                }, snapshotPath)
                    .on("error", (err) => {
                        console.log("ffmpeg:", err);
                        rmSnapshot();

                        resolve(null);
                    })
                    .on("end", () => {
                        fs.readFile(`${snapshotPath}/${snapshotFileName}`, (err, data) => {
                            rmSnapshot();
                            resolve(data);
                        });
                    });
            });

            if (snapshotBuffer) {
                const thumbnailFile = await googleCloudService.uploadFile(googleStoragePostsBucketName, `${file.filename}_thumbnail`, snapshotBuffer);
                thumbnailURL = thumbnailFile.publicUrl();
            }
        }

        const newPost = new Post({
            creator: userId,
            description,
            postType,
            thumbnailURL,
            postURL: file.path
        });

        return await newPost.save();
    } catch (error) {
        throw error;
    }
}

export const deletePost = async (userId: string, postId: string) => {
    try {
        const post = await Post.findById(postId);

        const result = await Post.deleteMany({
            _id: postId,
            creator: userId
        });

        if (post) {
            let { postURL, thumbnailURL } = post;
            const promises: Promise<any>[] = [];

            if (postURL) {
                postURL = decodeURIComponent(postURL);

                const split = postURL.split("/");
                const postFileName = split[split.length - 1];

                promises.push(googleCloudService.deleteFile(googleStoragePostsBucketName, `${userId}/${postFileName}`));
            }

            if (thumbnailURL) {
                thumbnailURL = decodeURIComponent(thumbnailURL);

                const split = thumbnailURL.split("/");
                const thumbnailFileName = split[split.length - 1];

                promises.push(googleCloudService.deleteFile(googleStoragePostsBucketName, `${userId}/${thumbnailFileName}`));
            }

            if (promises.length) {
                await Promise.allSettled(promises);
            }
        }

        return result;
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

export const getPostDetail = async (userId: string, postId: string) => {
    try {

        const result = await Post.aggregate([
            {
                $match: { _id: new Types.ObjectId(postId) }
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
                    postURL: 1,
                    postType: 1,
                    description: 1,
                    creator: 1,
                    creatorModel: 1,
                    thumbnailURL: 1,
                    likeCount: { $size: "$likes" },
                    isLiked: { $in: [userId, "$likes.userId"] },
                }
            }
        ]).then(items => items[0]);

        if (result) {
            const isFollowing = await UserFollowing.exists({
                userId, followedUserId: result.creator
            }).then(item => item?._id != null);

            await Post.populate(result, {
                path: "creator",
                select: {
                    _id: true,
                    userName: true,
                    avatar: true,
                    isFollowing: { $eq: [true, isFollowing] }
                },
            });
        }

        return result;
    } catch (error) {
        throw error;
    }

}