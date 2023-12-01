import { RequestHandler, raw } from "express";
import * as profileService from "../../services/profile/profile.services.js";

export const getProfile: RequestHandler = async (req, res, next) => {
  const { profileId } = req.params;
  const user: any = req.user;
  const userId = user["_id"];

  try {
    const result = await profileService.getProfile(profileId, userId);

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

export const searchProfiles: RequestHandler = async (req, res, next) => {
  const { query } = req.query;
  
  try {
    const results = await profileService.searchProfiles(<string>query);

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};