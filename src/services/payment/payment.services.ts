import Stripe from "stripe";
import { stripeCurrency, stripePublishableKey, stripeSecretKey, stripeWebhookSecret } from "../../config/app.config";
import { BusinessConfig } from "../../models/business/business-configs.model";

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });

export const createPaymentSheet = async (
    { customerStripeId,
        amount,
        metadata,
        transferAccountId
    }: {
        customerStripeId?: string,
        amount: number,
        metadata: any,
        transferAccountId?: string
    }) => {
    try {
        const commissionRateConfig = await BusinessConfig.findOne({ configName: 'SUBSCRIPTION_COMMISSION_RATE' });
        const commissionRate = Number.parseFloat(commissionRateConfig!.configValue);

        if (!customerStripeId) {
            const customer = await stripe.customers.create();
            customerStripeId = customer.id;
        }
        
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerStripeId },
            { apiVersion: "2022-11-15" }
        );

        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount,
            currency: stripeCurrency,
            customer: customerStripeId,
            metadata
        }

        if (transferAccountId) {
            paymentIntentParams.application_fee_amount = amount * commissionRate;
            paymentIntentParams.transfer_data = {
                destination: transferAccountId
            }
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

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

export const createPaymentWebhookEvent = (body: any, stripeSignature: string) => {
    try {
        const event = stripe.webhooks.constructEvent(body, stripeSignature, stripeWebhookSecret);

        return event;
    } catch (error) {
        throw error;
    }
}

export const createSubscription = async ({
    customerStripeId,
    amount,
    productId,
    interval,
    interval_count,
    metadata,
    transferAccountId
}: {
    customerStripeId?: string,
    amount: number,
    productId: string,
    interval: Stripe.SubscriptionCreateParams.Item.PriceData.Recurring.Interval,
    interval_count: number,
    metadata: any,
    transferAccountId?: string
}) => {
    try {
        const commissionRateConfig = await BusinessConfig.findOne({ configName: 'SUBSCRIPTION_COMMISSION_RATE' });
        const commissionRate = Number.parseFloat(commissionRateConfig!.configValue);

        if (!customerStripeId) {
            const customer = await stripe.customers.create();
            customerStripeId = customer.id;
        }

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerStripeId },
            { apiVersion: "2022-11-15" }
        );

        let subscriptionParams: Stripe.SubscriptionCreateParams = {
            customer: customerStripeId,
            payment_behavior: "default_incomplete",
            items: [
                {
                    price_data: {
                        currency: stripeCurrency,
                        unit_amount: amount,
                        product: productId,
                        recurring: {
                            interval,
                            interval_count
                        }
                    }
                },
            ],
            metadata,
            expand: ['latest_invoice.payment_intent'],
        };

        if (transferAccountId) {
            subscriptionParams.application_fee_percent = commissionRate * 100;
            subscriptionParams.transfer_data = {
                destination: transferAccountId
            }
        }

        const subscription = await stripe.subscriptions.create(subscriptionParams);

        const latestInvoice = <Stripe.Invoice>subscription.latest_invoice;
        const paymentIntent = <Stripe.PaymentIntent>latestInvoice.payment_intent;

        return {
            subscriptionId: subscription.id,
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customerStripeId,
            publishableKey: stripePublishableKey,
        };
    } catch (error) {
        throw error;
    }
}

export const getSubscription = async (stripeSubscriptionId: string) => {
    try {
        const subscription:Stripe.Subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        return subscription;
    } catch (error:any) {
        if(error.statusCode == '404') {
            return null;
        } else 
            throw error;
    }
}

export const cancelSubscription = async (stripeSubscriptionId: string) => {
    try {
        const deletedSubscription = await stripe.subscriptions.del(stripeSubscriptionId);

        return deletedSubscription;
    } catch (error) {
        throw error;
    }
}