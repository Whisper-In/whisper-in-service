import { RequestHandler, raw } from "express";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import * as profileService from "../../services/profile/profile.services.js";
import * as paymentService from "../../services/payment/payment.services.js";
import * as userService from "../../services/user/user.services.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { stripeProductId as stripeSubscriptionProductId } from "../../config/app.config.js";
import { SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";

export const getProfile: RequestHandler = async (req, res, next) => {
  const { profileId } = req.params;
  const isAI = req.query.isAI == "true";
  const user: any = req.user;
  const userId = user["_id"];

  try {
    const result = await profileService.getProfile(profileId, userId, isAI);

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

export const searchProfiles: RequestHandler = async (req, res, next) => {
  const { query } = req.params;

  try {
    const results = await profileService.searchProfiles(query);

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

export const createPaymentSheet: RequestHandler = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const metadata: { userId: string, aiProfileId: string } = req.body.metadata;
    let customerStripeId: string | undefined;

    const userProfile = await UserProfile.findById(metadata.userId);

    if (!userProfile) {
      return res.status(404).json({ error: "User Profile not found." });
    } else {
      customerStripeId = userProfile.stripeId;
    }

    const aiProfile = await AIProfile.findById(metadata.aiProfileId);

    if (!aiProfile) {
      return res.status(404).json({ error: "AI Profile not found." });
    }

    const paymentIntent = await paymentService.createPaymentSheet({ customerStripeId, amount, metadata, transferAccountId: aiProfile?.stripeAccountId });

    if (!customerStripeId) {
      customerStripeId = paymentIntent.customer;

      UserProfile.findOneAndUpdate({ _id: metadata.userId }, { stripeId: customerStripeId }).exec();
    }

    res.json(paymentIntent);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}

export const createPaymentSubscription: RequestHandler = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const metadata: { userId: string, aiProfileId: string } = req.body.metadata;
    let customerStripeId: string | undefined;

    const userProfile = await UserProfile.findById(metadata.userId);

    if (!userProfile) {
      return res.status(404).json({ error: "User Profile not found." });
    } else {
      customerStripeId = userProfile.stripeId;
    }

    const aiProfile = await AIProfile.findById(metadata.aiProfileId);

    if (!aiProfile) {
      return res.status(404).json({ error: "AI Profile not found." });
    }

    const paymentIntent = await paymentService.createSubscription({
      customerStripeId,
      amount,
      interval: "month",
      interval_count: 1,
      productId: stripeSubscriptionProductId,
      metadata,
      transferAccountId: aiProfile?.stripeAccountId
    });

    if (!customerStripeId) {
      customerStripeId = paymentIntent.customer;

      UserProfile.findOneAndUpdate({ _id: metadata.userId }, { stripeId: customerStripeId }).exec();
    }

    res.json(paymentIntent);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}

export const cancelSubscription: RequestHandler = async (req, res, next) => {
  try {
    const aiProfileId = req.body.aiProfileId;
    const user: any = req.user;
    const userId = user["_id"];

    const subscription = await UserAISubscription.findOne({ aiProfileId, userId });

    if (subscription) {
      const updateUserAISubscription = async () => {
        await userService.updateUserAISubscription(userId, aiProfileId, SubscriptionStatus.DELETED);

        return res.status(200).json(subscription);
      }

      if (subscription.stripeSubscriptionId) {
        const stripeSubscription = await paymentService.getSubscription(subscription.stripeSubscriptionId);

        if (stripeSubscription && stripeSubscription.status == 'active') {
          const deletedSubscription = await paymentService.cancelSubscription(subscription.stripeSubscriptionId);

          return res.status(200).json(deletedSubscription);
        } else {
          await updateUserAISubscription();
        }
      }
      else {
        await updateUserAISubscription();
      }

    } else {
      return res.status(400).json({ error: "Subscription does not exists." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}

export const getUserChatHistory: RequestHandler = (req, res, next) => { };
