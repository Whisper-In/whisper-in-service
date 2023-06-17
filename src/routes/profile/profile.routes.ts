import express from "express";
import passport from "passport";
import {
  getProfile,
  searchProfiles,
} from "../../controllers/profile/profile.controller.js";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.get(
  "/:profileId",
  passportJWTMiddleware,
  getProfile
);

router.get("/search/:query", passportJWTMiddleware, searchProfiles);

export default router;
