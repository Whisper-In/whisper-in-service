import { RequestHandler } from "express";
import * as userService from "../../services/user/user.services.js";
import * as googleCloudService from "../../services/google-cloud/google-cloud.service.js";
import { googleStorageProfileBucketName, stripeSubscriptionProductId } from "../../config/app.config.js";
import * as paymentService from "../../services/payment/payment.services.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";

export const createUserSubscription: RequestHandler = async (req, res, next) => {
    const profileId = <string>req.body.profileId;
    const tier = Number.parseInt(<string>req.body.tier ?? 0);
    const subscriptionId = <string>req.body.subscriptionId;
    const user: any = req.user;
    const userId = user["_id"];

    try {
        await userService.createUserSubscription(userId, profileId, tier, subscriptionId);

        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const getUserProfile: RequestHandler = async (req, res, next) => {
    const user: any = req.user;
    const userId = user["_id"];

    try {
        const result = await userService.getUserProfile(userId);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const updateUserProfile: RequestHandler = async (req, res, next) => {
    try {
        const result = await userService.updateUserProfile(req.body);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const updateUserTnC: RequestHandler = async (req, res, next) => {
    try {
        const { userId, isAgreeTnC } = req.body;

        const result = await userService.updateUserTnC(userId, isAgreeTnC);

        res.status(204).json(result);
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const updateUserAvatar: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const file = req.file;

        if (!file) {
            throw "No file was provided in the request.";
        }

        const result = await userService.updateUserAvatar(userId, file);

        return res.status(200).send(result);
    } catch (error) {
        return res.status(400).json({ error });
    }
}

export const updateUserVoice: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const file = req.file;

        if (file) {
            //Upload to Google Cloud            
            const uploadedFile = await googleCloudService.uploadFile(
                googleStorageProfileBucketName,
                `${userId}/${file.fieldname}`, file.buffer);

            file.path = uploadedFile.publicUrl();
        }

        const result = await userService.updateUserVoice(userId, file);

        return res.status(200).send(result);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error });
    }
}

export const createPaymentSheet: RequestHandler = async (req, res, next) => {
    try {
        const tier = req.body.tier;
        const profileId = req.body.profileId;
        const user = req.user as any;
        const userId = user["_id"];

        const userProfile = await UserProfile.findById(userId);

        const metadata: { userId: string, profileId: string } = { userId, profileId };

        const subscriptionProfile = await UserProfile.findById(metadata.profileId);

        if (!subscriptionProfile) {
            return res.status(404).json({ error: "Subscription Profile not found." });
        }

        const priceTier = subscriptionProfile.priceTiers.find(p => p.tier == tier);
        if (!priceTier) {
            return res.status(404).json({ error: "Invalid price tier." });
        }

        const paymentIntent = await paymentService.createPaymentSheet({
            customerStripeId: userProfile?.stripeCustomerId,
            amount: priceTier.price * 100,
            metadata,
            transferAccountId: subscriptionProfile?.stripeConnectedAccountId
        });

        if (!userProfile?.stripeCustomerId) {
            UserProfile.findOneAndUpdate({ _id: user["_id"] }, { stripeCustomerId: userProfile?.stripeCustomerId }).exec();
        }

        res.json(paymentIntent);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}

export const createPaymentSubscription: RequestHandler = async (req, res, next) => {
    try {
        const tier = req.body.tier;
        const profileId = req.body.profileId;
        const user = req.user as any;
        const userId = user["_id"].toString();

        const userProfile = await UserProfile.findById(userId);

        const metadata: { userId: string, profileId: string } = { userId, profileId };

        const subscriptionProfile = await UserProfile.findById(metadata.profileId);

        if (!subscriptionProfile) {
            return res.status(404).json({ error: "Subscription Profile not found." });
        }

        const priceTier = subscriptionProfile.priceTiers.find(p => p.tier == tier);
        if (!priceTier) {
            return res.status(404).json({ error: "Invalid price tier." });
        }

        const paymentIntent = await paymentService.createSubscription({
            customerStripeId: userProfile?.stripeCustomerId,
            amount: priceTier.price * 100,
            interval: "month",
            interval_count: 1,
            productId: stripeSubscriptionProductId,
            metadata,
            transferAccountId: subscriptionProfile?.stripeConnectedAccountId
        });

        if (!userProfile?.stripeCustomerId) {
            UserProfile.findOneAndUpdate({ _id: metadata.userId }, { stripeCustomerId: paymentIntent.customer }).exec();
        }

        res.json(paymentIntent);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Payment failed" });
    }
}

export const cancelSubscription: RequestHandler = async (req, res, next) => {
    try {
        const profileId = req.body.profileId;
        const user: any = req.user;
        const userId = user["_id"];

        const subscription = await UserSubscription.findOne({ subscribedUserId: profileId, userId });

        if (subscription) {
            const updateUserSubscription = async () => {
                await userService.updateUserSubscription(userId, profileId, SubscriptionStatus.DELETED);

                return res.status(200).json(subscription);
            }

            if (subscription.stripeSubscriptionId) {
                const stripeSubscription = await paymentService.getSubscription(subscription.stripeSubscriptionId);

                if (stripeSubscription && stripeSubscription.status == 'active') {
                    const deletedSubscription = await paymentService.cancelSubscription(subscription.stripeSubscriptionId);

                    return res.status(200).json(deletedSubscription);
                } else {
                    await updateUserSubscription();
                }
            }
            else {
                await updateUserSubscription();
            }

        } else {
            return res.status(400).json({ error: "Subscription does not exists." });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}

export const followUser: RequestHandler = async (req, res, next) => {
    const { _id } = <any>req.user;
    const { profileId } = req.params;

    try {
        const result = await userService.followUser(_id, profileId);

        res.status(200).end();
    } catch (error) {
        res.status(400).json({ error })
    }
}

export const unfollowUser: RequestHandler = async (req, res, next) => {
    const { _id } = <any>req.user;
    const { profileId } = req.params;

    try {
        const result = await userService.unfollowUser(_id, profileId);

        res.status(200).end();
    } catch (error) {
        res.status(400).json({ error })
    }
}