import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT;
export const mongoDBConnectionString = process.env.MONGODB_CONNECTION_STRING as string;
export const openAIApiKey = process.env.OPENAI_API_KEY;