import passport from "passport";
import AppleStrategy from "passport-apple";
import { appleSignInCallbackURL, appleSignInKeyFileName, appleSignInKeyID, appleSignInServiceID, appleSignInWebCallbackURL, appleTeamID } from "../../config/app.config.js";
import path from "path";
import { UserProfile } from "../../models/user/user-profile.model.js";
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