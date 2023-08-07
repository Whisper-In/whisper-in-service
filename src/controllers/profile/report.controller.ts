import { RequestHandler } from "express";
import * as reportService from "../../services/business/report.services.js"

export const getReportReasons: RequestHandler = async (req, res, next) => {
    try {
        const result = await reportService.getReportReasons();

        res.status(200).json(result);
    } catch (error) {
        res.status(400).send({ error });
    }
}

export const sendReport: RequestHandler = async (req, res, next) => {    
    try {        
        const user: any = req.user;
        const userId = user["_id"];
        const { aiProfileId, reportReasonCode } = req.body;

        await reportService.sendReport(userId, aiProfileId, reportReasonCode);
        
        res.status(200).send();
    } catch (error) {
        res.status(400).send({ error });
    }
}