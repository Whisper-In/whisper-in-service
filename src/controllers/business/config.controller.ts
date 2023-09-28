import { RequestHandler } from "express";
import * as configService from "../../services/business/config.services.js";

export const getConfig: RequestHandler = async (req, res, next) => {
    try {
        const { configName } = req.params;
        const result = await configService.getConfig(configName);

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
};