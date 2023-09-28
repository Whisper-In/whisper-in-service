import { Express } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { Chat, IChat } from "../../models/chat/chat.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { googleCallbackURL, googleClientID, googleClientSecret, googleWebCallbackURL } from "../../config/app.config.js";
import { IUserSubscription, SubscriptionStatus, UserSubscription } from "../../models/user/user-subscriptions.model.js";

const googleVerification = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: VerifyCallback
) => {
  //Get user from db or create one if it does not exists
  try {
    const existingUser = await UserProfile.findOne({
      email: profile.email,
    });

    if (existingUser) {
      return done(null, existingUser);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const newUser = await new UserProfile({
      birthday: profile.birthday,
      googleId: profile.id,
      email: profile.email,
      name: profile.displayName,
      userName: (<string>profile.displayName).toLocaleLowerCase().replace(" ", "_"),
      avatar: profile.picture,
      gender: profile.gender,
    }).save();   

    done(null, newUser);
  } catch (error) {
    console.log(error);
  }
};

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
    },
    googleVerification
  )
);

passport.use(
  "google-web",
  new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleWebCallbackURL,
    },
    googleVerification
  )
);