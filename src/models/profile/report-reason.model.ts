import { ObjectId, Schema, model } from "mongoose";

export interface IReportReason {
    _id: ObjectId;
    reportReasonCode: string;
    reportReasonDescription: string;    
}

export const ReportReasonSchema = new Schema<IReportReason>(
    {
        reportReasonCode: { type: String, unique: true },
        reportReasonDescription: String
    },
    { timestamps: true }
);

const ReportReason = model<IReportReason>("ReportReason", ReportReasonSchema);

export { ReportReason };
