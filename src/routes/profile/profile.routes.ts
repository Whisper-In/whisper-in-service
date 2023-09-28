import express from "express";
import * as profileController from "../../controllers/profile/profile.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";

const router = express.Router();

router.get(
  "/:profileId",
  passportJWTMiddleware,
  profileController.getProfile
);

router.get("/search/:query", passportJWTMiddleware, profileController.searchProfiles);

export default router;
