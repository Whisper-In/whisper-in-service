import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { ReportReason } from '../../src/models/profile/report-reason.model.js';
import { exit } from 'process';
import reportReasonsJson from '../../datasets/report-reasons.datasets.json' assert { type: "json" };

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const insertReportReasons = async () => {
    try {
        await connect(process.env.MONGODB_CONNECTION_STRING as string);

        await ReportReason.deleteMany({});
        await ReportReason.insertMany(reportReasonsJson);

        console.log(`Insert Report Reasons successful!`);
    } catch (error) {
        console.log(error);
    } finally {
        exit(1);
    }
};

export default insertReportReasons();
