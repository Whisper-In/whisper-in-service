import express from "express";
import * as configController from "../../controllers/business/config.controller.js";

const router = express.Router();

router.get("/:configName", configController.getConfig);

export default router;
