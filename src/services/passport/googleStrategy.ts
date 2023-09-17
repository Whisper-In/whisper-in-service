import { Express } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { Chat, IChat } from "../../models/chat/chat.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { googleCallbackURL, googleClientID, googleClientSecret, googleWebCallbackURL } from "../../config/app.config.js";
import { IUserAISubscription, SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";

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

    const defaultAiProfiles = await AIProfile.find({
      isDefault: true,
    });

    if (defaultAiProfiles.length) {
      Chat.create(
        defaultAiProfiles.map<IChat>((aiProfile) => ({
          profiles: [
            {
              profile: newUser.id,
              profileModel: UserProfile.modelName,
            },
            {
              profile: aiProfile.id,
              profileModel: AIProfile.modelName
            }
          ],
        }))
      );

      UserAISubscription.create(
        defaultAiProfiles.map<IUserAISubscription>((aiProfile) => ({
          aiProfileId: aiProfile.id,
          tier: 0,
          status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED],
          userId: newUser.id
        }))
      )
    }

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