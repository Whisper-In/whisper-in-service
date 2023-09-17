import passport from "passport";
import AppleStrategy from "passport-apple";
import { appleSignInCallbackURL, appleSignInKeyFileName, appleSignInKeyID, appleSignInServiceID, appleSignInWebCallbackURL, appleTeamID } from "../../config/app.config.js";
import path from "path";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { AIProfile } from "../../models/ai/ai-profile.model.js";
import { Chat, IChat } from "../../models/chat/chat.model.js";
import { IUserAISubscription, SubscriptionStatus, UserAISubscription } from "../../models/user/user-ai-subscription.model.js";
import jwt from "jsonwebtoken";

const appleVerification:AppleStrategy.VerifyFunctionWithRequest = async (req, accessToken, refreshToken, idToken, profile, cb) => {
  const decodedToken: any = jwt.decode(<any>idToken);

  //Get user from db or create one if it does not exists
  try {
    const existingUser = await UserProfile.findOne({
      appleId: decodedToken.sub,
    });

    if (existingUser) {
      return cb(null, existingUser);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const newUser = await new UserProfile({
      appleId: decodedToken.sub,
      email: decodedToken.email,
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

    cb(null, newUser);
  } catch (error) {
    console.log(error);
  }
}

passport.use('apple', new AppleStrategy({
  clientID: appleSignInServiceID,
  teamID: appleTeamID,
  callbackURL: appleSignInCallbackURL,
  keyID: appleSignInKeyID,
  privateKeyLocation: path.join(process.cwd(), 'resources', appleSignInKeyFileName),
  scope: ['name', 'email'],
  passReqToCallback: true
}, appleVerification));

passport.use('apple-web', new AppleStrategy({
  clientID: appleSignInServiceID,
  teamID: appleTeamID,
  callbackURL: appleSignInWebCallbackURL,
  keyID: appleSignInKeyID,
  privateKeyLocation: path.join(process.cwd(), 'resources', appleSignInKeyFileName),
  scope: ['name', 'email'],
  passReqToCallback: true
}, appleVerification));