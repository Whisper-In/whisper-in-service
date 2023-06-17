import { RequestHandler, raw } from "express";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { IProfileDto } from "../../dtos/profile/profile.dtos.js";
import * as profileService from "../../services/profile/profile.services.js";

export const getProfile: RequestHandler = async (req, res, next) => {
  const { profileId } = req.params;
  const isAI = req.query.isAI == "true";
  const user: any = req.user;
  const userId = user["_id"];

  try {
    const result = await profileService.getProfile(profileId, userId, isAI);

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

export const searchProfiles: RequestHandler = async (req, res, next) => {
  const { query } = req.params;

  try {
    const results = await profileService.searchProfiles(query);

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

export const getUserChatHistory: RequestHandler = (req, res, next) => { };
