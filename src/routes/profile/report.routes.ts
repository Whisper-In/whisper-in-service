import express, { Request, Response } from "express";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";
import * as reportController from "../../controllers/profile/report.controller.js";

const router = express.Router();

router.get(
    "/reasons",
    reportController.getReportReasons
    //#swagger.tags = ['Profile']
);

router.post(
    "/",
    passportJWTMiddleware,
    reportController.sendReport
    //#swagger.tags = ['Profile']
)

export default router;