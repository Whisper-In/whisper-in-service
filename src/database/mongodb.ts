import mongoose, { connect } from "mongoose";
import { NODE_ENV, mongoDBConnectionString } from "../config/app.config";
import { MongoMemoryServer } from "mongodb-memory-server";
import "../models/user/user-profile.model"

let memoryMongoDB: MongoMemoryServer | undefined;

export const connectMongoDB = async () => {
    try {
        let connectionString = mongoDBConnectionString;

        if (NODE_ENV == "test") {                
            memoryMongoDB = await MongoMemoryServer.create();
            connectionString = memoryMongoDB.getUri();
        }

        connect(connectionString)
    } catch (err) {
        throw err;
    }
}

export const disconnectMongDB = async () => {
    try {        
        await mongoose.connection.close();

        if (memoryMongoDB) {            
            await memoryMongoDB.stop();
        }
    } catch (err) {
        throw err;
    }
}