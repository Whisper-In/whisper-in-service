import passport from "passport";
import { Strategy as passportJWTStrategy, ExtractJwt } from "passport-jwt";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { jwtSecret } from "../../config/app.config.js";

export const JWTStrategy = new passportJWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  },
  async (payload, done) => {
    try {
      const user = await UserProfile.findById(payload.id);

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  }
)