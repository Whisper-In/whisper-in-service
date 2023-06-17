import { RequestHandler } from "express";
import * as paymentService from "../../services/payment/payment.services.js";
import * as userService from "../../services/user/user.services.js";
import { SubscriptionStatus } from "../../models/user/user-ai-subscription.model.js";

export const createPaymentSheet: RequestHandler = async (req, res, next) => {
    try {
        const amount = req.body.amount;
        const metadata = req.body.metadata;
        let customerStripeId = req.body?.customerStripeId;

        const paymentIntent = await paymentService.createPaymentSheet(customerStripeId, amount, metadata);

        res.json(paymentIntent);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}

export const paymentWebhook: RequestHandler = async (req, res, next) => {
    const stripeSignature = <string>req.headers['stripe-signature'];

    let event;

    try {
        event = paymentService.createPaymentWebhookEvent(req.body, stripeSignature);
    } catch (error) {
        console.log(error);
        return;
    }

    const paymentIntent = <any>event.data.object;

    const metadata = paymentIntent.metadata;
    const userId = metadata.userId;
    const aiProfileId = metadata.aiProfileId;

    if(!userId) {
        console.log("User Id not found in metadata.");
    }

    if(!aiProfileId) {
        console.log("AI Profile Id not found in metadata.");
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            userService.updateUserAISubscription(userId, aiProfileId, SubscriptionStatus.SUCCEEDED);
            break;
        case 'payment_intent.payment_failed':
            userService.updateUserAISubscription(userId, aiProfileId, SubscriptionStatus.FAILED);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`)
    }
}