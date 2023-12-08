import { BusinessConfig } from "../src/models/business/business-configs.model";
import businessConfigJson from '../datasets/business-configs.datasets.json';
import { disconnectMongDB } from "../src/database/mongodb";
import mongoose from "mongoose";
import { server } from "../app";

const FILTER_COLLECTIONS = [
    BusinessConfig.collection.name
]

beforeAll(async () => {        
    await BusinessConfig.insertMany(businessConfigJson);   
});

afterAll(async () => {
    try {
        await mongoose.connection.dropDatabase();
        await disconnectMongDB();

        await server.close();
    } catch (err) {
        console.error(err);
    }
});

afterEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        if (FILTER_COLLECTIONS.includes(key)) {
            continue;
        }

        const collection = collections[key];
        await collection.deleteMany();
    }
})