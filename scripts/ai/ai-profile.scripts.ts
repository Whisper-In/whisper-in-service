import { connect } from "mongoose";
import aiProfileJSON from "../../datasets/ai-profile.datasets.json" assert { type: "json" };
import { AIProfile } from "../../src/models/ai/ai-profile.model.js";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

const insertAIProfiles = async () => {
  try {
    await connect(process.env.MONGODB_CONNECTION_STRING as string);

    await AIProfile.insertMany(aiProfileJSON);
    
    console.log(`Insert AI profiles successful!`);    
  } catch (error) {
    console.log(error);
  } finally {
    exit(1);
  }
};

export default insertAIProfiles();
