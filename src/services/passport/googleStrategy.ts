import { Express } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { Chat, IChat } from "../../models/chat/chat.model.js";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { mongo } from "mongoose";

passport.use(
  new GoogleStrategy(
    {
      clientID: <string>process.env.GOOGLE_CLIENT_ID,
      clientSecret: <string>process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: <string>process.env.GOOGLE_CALLBACK_URL,
    },
    async (
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
        }

        done(null, newUser);
      } catch (error) {
        console.log(error);
      }
    }
  )
);
