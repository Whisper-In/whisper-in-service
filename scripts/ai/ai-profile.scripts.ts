import { connect } from "mongoose";
import aiProfileJSON from "../../datasets/ai-profile.datasets.json" assert { type: "json" };
import { AIProfile } from "../../src/models/ai/ai-profile.model.js";
import { exit } from "process";
import dotenv from 'dotenv';

dotenv.config({path: `.env.${process.env.NODE_ENV}`})

const insertAIProfiles = async () => {
  try {
    await connect(process.env.MONGODB_CONNECTION_STRING as string);

    await AIProfile.deleteMany({});
    await AIProfile.insertMany(aiProfileJSON);
    
    console.log(`Insert AI profiles successful!`);    
  } catch (error) {
    console.log(error);
  } finally {
    exit(1);
  }
};

export default insertAIProfiles();
