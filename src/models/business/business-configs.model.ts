import { ObjectId, Schema, model } from "mongoose";

export interface IBusinessConfig {
    _id: ObjectId;
    configName: string;
    configValue: string;
}

export const BusinessConfigSchema = new Schema<IBusinessConfig>(
    {
        configName: { type: String, required: true, unique: true },
        configValue: String
    },
    { timestamps: true }
);

const BusinessConfig = model<IBusinessConfig>("BusinessConfig", BusinessConfigSchema);

export { BusinessConfig };
