import { RequestHandler } from "express";

export const getUserProfile: RequestHandler = (req, res, next) => {
  const { profileId } = req.params;

  
};

export const getUserChatHistory: RequestHandler = (req, res, next) => {};
