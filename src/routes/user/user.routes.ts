import express from "express";
import passport from "passport";
import {
  getUserChatHistory,
  getUserProfile,
} from "../../controllers/user/user.controller.js";
import { passpotJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";

const router = express.Router();

router.get(
  "/:profileId",
  passpotJWTMiddleware,
  getUserProfile
);
