import passport from "passport";
import AppleStrategy from "passport-apple";
import { appleSignInCallbackURL, appleSignInKeyFileName, appleSignInKeyID, appleSignInServiceID, appleSignInWebCallbackURL, appleTeamID } from "../../config/app.config.js";
import path from "path";
import { UserProfile } from "../../models/user/user-profile.model.js";
import jwt from "jsonwebtoken";

const appleVerification: AppleStrategy.VerifyFunctionWithRequest = async (req, accessToken, refreshToken, idToken, profile, cb) => {
  const decodedToken: any = jwt.decode(<any>idToken);
  const splitEmail = decodedToken.email.split("@");
  const userName = splitEmail[0];

  //Get user from db or create one if it does not exists
  try {
    let existingUser = await UserProfile.findOne({
      appleId: decodedToken.sub,
    });

    if (existingUser) {
      if (!existingUser.userName) {
        existingUser = await UserProfile.findByIdAndUpdate(decodedToken.sub, {
          name: userName,
          userName
        }, { new: true });
      }

      return cb(null, existingUser!);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const newUser = await new UserProfile({
      appleId: decodedToken.sub,
      email: decodedToken.email,
      name: userName,
      userName
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