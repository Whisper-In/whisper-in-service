import express from "express";
import { getUserChatHistory, getUserProfile } from "../../controllers/user/user.controller.js";

const router = express.Router();

router.route("/:profileId").get(getUserProfile);