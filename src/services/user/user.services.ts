import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
import { IUserProfile, TierChatFeature, UserProfile } from "../../models/user/user-profile.model.js";
import { BusinessConfig } from "../../models/business/business-configs.model.js";
import * as elevenLabsService from "../../services/elevenlabs/elevenlabs.services.js";
import { multerUploadMiddleware } from "../../middlewares/multer.middleware.js";
import { profileUploadHandler } from "../../utils/multer.js";
import multer from "multer";
import { Post } from "../../models/content/post.model.js";
import { UserLikedPost } from "../../models/content/user-liked-post.model.js";
import { isFulfilled } from "../../utils/promise.js";

export const createUserSubscription = async (userId: string, profileId: string, tier: number, stripeSubscriptionId?: string) => {
    try {
        let status = SubscriptionStatus[stripeSubscriptionId ? SubscriptionStatus.PENDING : SubscriptionStatus.SUCCEEDED];

        const existingSubscription = await UserSubscription.exists({ userId, subscribedUserId: profileId });

        if (existingSubscription) {
            UserSubscription.findOneAndUpdate(
                {
                    userId,
                    subscribedUserId: profileId
                },
                {
                    tier,
                    stripeSubscriptionId,
                    status
                }).exec();
        } else {
            const subscriptionProfile = await UserProfile.findById(profileId);

            if (subscriptionProfile) {
                const today = new Date();
                const priceTier = subscriptionProfile.priceTiers.find(p => p.tier == tier);

                if (priceTier) {
                    if (priceTier.price > 0 && !stripeSubscriptionId) {
                        throw "No payment found.";
                    }
                }

                const newSubscription = new UserSubscription({
                    subscribedUserId: profileId,
                    userId,
                    tier,
                    status,
                    expiryDate: new Date(today.setFullYear(today.getFullYear() + 1)),
                    stripeSubscriptionId
                });

                newSubscription.save();
            } else {
                throw "Invalid profile id provided."
            }
        }
    } catch (error) {
        throw error;
    }
}

export const updateUserSubscription = async (userId: string, profileId: string, status: SubscriptionStatus) => {
    try {
        await UserSubscription.findOneAndUpdate({ subscribedUserId: profileId, userId }, { status: SubscriptionStatus[status] });
    } catch (error) {
        throw error;
    }
}

export const getUserProfile = async (userId: string) => {
    try {
        const result = await UserProfile.findById(userId);

        let today = new Date();

        const followerCountQuery = UserSubscription.count({
            $and: [{
                subscribedUserId: userId,
                status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED]
            },
            { $or: [{ expiryDate: { $gte: today } }, { expiryDate: { $exists: false } }] }]
        });

        const postCountsQuery = Post.aggregate([
            {
                $match: { creator: userId }
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
            followerCountQuery,
            postCountsQuery
        ]);

        const followerCount = isFulfilled(promiseResults[0]) ? promiseResults[0].value : 0;
        const postCounts = isFulfilled(promiseResults[1]) ? promiseResults[1].value : null;

        return {
            _id: result?._id,
            name: result?.name,
            userName: result?.userName,
            avatar: result?.avatar,
            email: result?.email,
            googleId: result?.googleId,
            stripeId: result?.stripeId,
            isAgreeTnC: result?.isAgreeTnC,
            priceTiers: result?.priceTiers,
            bio: result?.bio,
            instagram: result?.instagram,
            youtube: result?.youtube,
            isSubscriptionOn: result?.isSubscriptionOn,
            stripeConnectedAccountId: result?.stripeConnectedAccountId,
            aiDescription: result?.aiDescription,
            voiceId: result?.voiceId,
            voiceSampleURL: result?.voiceSampleURL,
            followerCount,
            postCount: postCounts?.postCount,
            totalLikeCount: postCounts?.likeCount
        };
    } catch (error) {
        throw error;
    }
}

export const updateUserProfile = async (userProfile: IUserProfile) => {
    try {
        const minSubscriptionFeeQuery = await BusinessConfig.findOne({ configName: "MIN_SUBSCRIPTION_FEE" });
        const minSubscriptionFee = Number.parseInt(minSubscriptionFeeQuery?.configValue ?? "0");

        if (userProfile.isSubscriptionOn) {
            const priceTier = userProfile.priceTiers?.length ? userProfile.priceTiers[0] : undefined;
            const price = Math.max((priceTier?.price ?? 0), minSubscriptionFee);

            userProfile.priceTiers = [{
                features: priceTier?.features ?? [],
                tier: priceTier?.tier ?? 0,
                price
            }]
        }

        if (userProfile.userName) {
            userProfile.userName = userProfile.userName.toLowerCase();
        }

        const result = await UserProfile.findByIdAndUpdate(
            { _id: userProfile._id },
            userProfile,
            { new: true }
        );

        return result;
    } catch (error) {
        throw error;
    }
}

export const updateUserTnC = async (userId: string, isAgreeTnC: boolean) => {
    try {
        const result = await UserProfile.findByIdAndUpdate({ _id: userId }, { isAgreeTnC });

        return result;
    } catch (error) {
        throw error;
    }
}

export const updateUserAvatar = async (userId: string, file: Express.Multer.File) => {
    try {
        const result = await UserProfile.findByIdAndUpdate(
            { _id: userId },
            {
                avatar: file.path
            },
            { new: true });

        if (result) {
            //To force frontend to refresh
            result.avatar = `${result.avatar}?${Date.now()}`
        }

        return result;
    } catch (error) {
        throw error;
    }
}

export const updateUserVoice = async (userId: string, file?: Express.Multer.File) => {
    try {
        const user = await UserProfile.findById(userId);

        if (user?.voiceId) {
            elevenLabsService.deleteVoice(user.voiceId).catch(() => { });
        }

        let voiceId: string | undefined;

        if (file) {
            const blob = new Blob([file.buffer], { type: file.mimetype });
            const voiceResult = await elevenLabsService.createVoice(userId, [{ blob, fileName: file.fieldname }]);

            voiceId = voiceResult.voice_id;
        }

        const priceTier = user?.priceTiers[0]!;

        const audioChatFeature = TierChatFeature[TierChatFeature.AUDIO];
        if (voiceId) {
            if (!priceTier.features.includes(audioChatFeature)) {
                priceTier.features.push(audioChatFeature);
            }
        } else {
            priceTier.features = priceTier.features.filter(f => f != audioChatFeature);
        }

        const result = await UserProfile.findByIdAndUpdate(
            { _id: userId },
            {
                voiceId: voiceId ?? null,
                voiceSampleURL: file?.path ?? null,
                priceTiers: user?.priceTiers
            },
            { new: true })
            .catch((error) => {
                if (voiceId) {
                    elevenLabsService.deleteVoice(voiceId);
                }

                throw error;
            });

        //To force frontend to refresh
        if (result?.voiceSampleURL) {
            result.voiceSampleURL = `${result.voiceSampleURL}?${Date.now()}`
        }

        return result;
    } catch (error) {
        console.log(error)
        throw error;
    }
}
