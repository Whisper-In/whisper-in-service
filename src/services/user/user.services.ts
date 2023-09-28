import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";
import { IUserProfile, TierChatFeature, UserProfile } from "../../models/user/user-profile.model.js";
import { BusinessConfig } from "../../models/business/business-configs.model.js";
import * as elevenLabsService from "../../services/elevenlabs/elevenlabs.services.js";
import { multerUploadMiddleware } from "../../middlewares/multer.middleware.js";
import { profileUploadHandler } from "../../utils/multer.js";
import multer from "multer";

export const createUserSubscription = async (userId: string, profileId: string, tier: number, stripeSubscriptionId: string) => {
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
                const priceTier = subscriptionProfile.priceTiers.find(p => p.tier == tier);

                if (priceTier) {
                    if (priceTier.price > 0 && !stripeSubscriptionId) {
                        throw "No payment found.";
                    }

                    const today = new Date();

                    const newSubscription = new UserSubscription({
                        subscribedUserId: profileId,
                        userId,
                        tier,
                        status,
                        expiryDate: new Date(today.setFullYear(today.getFullYear() + 1)),
                        stripeSubscriptionId
                    });

                    newSubscription.save();
                }
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

        return result;
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

        userProfile.userName = userProfile.userName.toLowerCase();

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
