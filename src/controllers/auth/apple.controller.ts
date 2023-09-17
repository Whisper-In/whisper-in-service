import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Model } from "mongoose";
import {
    IUserProfile,
    IUserProfileMethods,
} from "../../models/user/user-profile.model.js";
import { appCallbackURL, appScheme } from "../../config/app.config.js";

export const appleCallback: RequestHandler = async (req, res, next) => {    
    const reqUser = <IUserProfile & IUserProfileMethods>req.user!;

    //Generate jwt token
    const jwtToken = reqUser.generateJWT();
    const user = {
        _id: reqUser._id,
        name: reqUser.name,
        email: reqUser.email,
        avatar: reqUser.avatar,
        isAgreeTnC: reqUser.isAgreeTnC
    };    

    res.redirect(
        `${appScheme}://login?user=${JSON.stringify(user)}&token=${jwtToken}`
    );
};

export const appleWebCallback: RequestHandler = async (req, res, next) => {    
    const reqUser = <IUserProfile & IUserProfileMethods>req.user!;

    //Generate jwt token
    const jwtToken = reqUser.generateJWT();
    const user = {
        _id: reqUser._id,
        name: reqUser.name,
        email: reqUser.email,
        avatar: reqUser.avatar,
        isAgreeTnC: reqUser.isAgreeTnC
    };    

    res.redirect(
        `${appCallbackURL}?user=${JSON.stringify(user)}&token=${jwtToken}`
    );
};
