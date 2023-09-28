import { BusinessConfig } from "../../models/business/business-configs.model.js";

export const getConfig = async (configName: string) => {
    try {
        const result = await BusinessConfig.findOne({ configName });

        return result;
    } catch (error) {
        throw error;
    }
};