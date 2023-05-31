import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Model } from "mongoose";
import {
  IUserProfile,
  IUserProfileMethods,
} from "../../models/user/user-profile.model.js";

export const googleCallback: RequestHandler = async (req, res, next) => {
  const reqUser = <IUserProfile & IUserProfileMethods>req.user!;

  //Generate jwt token
  const jwtToken = reqUser.generateJWT();
  const user = {
    _id: reqUser._id,
    name: reqUser.name,
    email: reqUser.email,
    avatar: reqUser.avatar    
  };  

  res.redirect(
    `${process.env.APP_SCHEME}://login?user=${JSON.stringify(user)}&token=${jwtToken}`
  );
};