import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { BusinessConfig } from '../../src/models/business/business-configs.model';
import { exit } from 'process';
import businessConfigJson from '../../datasets/business-configs.datasets.json';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const insertBusinessConfigs = async () => {
    try {
        await connect(process.env.MONGODB_CONNECTION_STRING as string);

        await BusinessConfig.deleteMany({});
        await BusinessConfig.insertMany(businessConfigJson);

        console.log(`Insert Business Configurations successful!`);
    } catch (error) {
        console.log(error);
    } finally {
        exit(1);
    }
};

export default insertBusinessConfigs();
