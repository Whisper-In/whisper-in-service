import express from "express";
import * as profileController from "../../controllers/profile/profile.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";

const router = express.Router();

router.get("/search", passportJWTMiddleware, profileController.searchProfiles);

router.get(
  "/:profileId",
  passportJWTMiddleware,
  profileController.getProfile
);

export default router;
