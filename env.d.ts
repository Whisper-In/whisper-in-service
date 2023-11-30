declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            HTTPS_PORT: string;
            NODEMAILER_PORT: string;
            NODEMAILER_HOST: string;
            NODEMAILER_SENDER: string;
            NODEMAILER_PASS: string;
            NODEMAILER_RECEIVER: string;
            MONGODB_CONNECTION_STRING: string;
            OPENAI_API_KEY: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            GOOGLE_CALLBACK_URL: string;
            GOOGLE_WEB_CALLBACK_URL: string;
            JWT_SECRET: string;
            APP_SCHEME: string;
            APP_CALLBACK_URL: string;
            STRIPE_PUBLISHABLE_KEY: string;
            STRIPE_SECRET_KEY: string;
            STRIPE_CURRENCY: string;
            STRIPE_WEBHOOK_SECRET: string;
            STRIPE_SUBSCRIPTION_PRODUCT_ID: string;
            ELEVENLABS_API_KEY: string;
            ELEVENLABS_BASE_URL: string;
            APPLE_TEAM_ID: string;
            APPLE_SIGN_IN_SERVICE_ID: string;
            APPLE_SIGN_IN_KEY_ID: string;
            APPLE_SIGN_IN_KEY_FILENAME: string;
            APPLE_SIGN_IN_CALLBACK_URL: string;
            APPLE_SIGN_IN_WEB_CALLBACK_URL: string;
            GOOGLE_STORAGE_POSTS_BUCKET_NAME: string;
            GOOGLE_STORAGE_PROFILE_BUCKET_NAME: string;
            GOOGLE_CLOUD_KEYFILE_NAME: string;
            WHISPERIN_CHAT_SERVICE_URL: string;
            FRONTEND_ORIGIN: string;
        }
    }
}