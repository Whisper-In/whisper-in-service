import {connect} from "mongoose";
import { mongoDBConnectionString } from "../config/app.config.js";
import "../models/user/user-profile.model.js"
import "../models/ai/ai-profile.model.js"


export const connectMongoDB = () => connect(mongoDBConnectionString);