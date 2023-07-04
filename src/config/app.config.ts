import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV != 'production' ? `.env.${process.env.NODE_ENV}` : '.env' });

export const port = process.env.PORT;
export const mongoDBConnectionString = <string>process.env.MONGODB_CONNECTION_STRING;
export const openAIApiKey = <string>process.env.OPENAI_API_KEY;
export const googleClientID = <string>process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = <string>process.env.GOOGLE_CLIENT_SECRET;
export const googleCallbackURL = <string>process.env.GOOGLE_CALLBACK_URL;
export const jwtSecret = <string>process.env.JWT_SECRET;
export const appScheme = <string>process.env.APP_SCHEME;
export const stripePublishableKey = <string>process.env.STRIPE_PUBLISHABLE_KEY;
export const stripeSecretKey = <string>process.env.STRIPE_SECRET_KEY;
export const stripeCurrency = <string>process.env.STRIPE_CURRENCY;
export const stripeWebhookSecret = <string>process.env.STRIPE_WEBHOOK_SECRET;
export const stripeProductId = <string>process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID;
export const elevenLabsAPIKey = <string>process.env.ELEVENLABS_API_KEY;
export const elevenLabsBaseURL = <string>process.env.ELEVENLABS_BASE_URL;