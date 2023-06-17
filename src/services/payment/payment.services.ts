import Stripe from "stripe";
import { stripeCurrency, stripePublishableKey, stripeSecretKey, stripeWebhookSecret } from "../../config/app.config.js";

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });

export const createPaymentSheet = async (customerStripeId: string, amount: number, metadata: any) => {
    try {
        if (!customerStripeId) {
            const customer = await stripe.customers.create();
            customerStripeId = customer.id;
        }

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerStripeId },
            { apiVersion: "2022-11-15" }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: stripeCurrency,
            customer: customerStripeId,
            metadata
        });

        return {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customerStripeId,
            publishableKey: stripePublishableKey,
        };
    } catch (error) {
        throw error;
    }
}

export const createPaymentWebhookEvent = (body:any, stripeSignature: string) => {
    try {
        const event = stripe.webhooks.constructEvent(body, stripeSignature, stripeWebhookSecret);

        return event;
    } catch (error) {
        throw error;
    }    
}