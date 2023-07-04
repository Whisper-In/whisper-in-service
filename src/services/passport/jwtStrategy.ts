import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserProfile } from "../../models/user/user-profile.model.js";
import { jwtSecret } from "../../config/app.config.js";

passport.use(
  new JWTStrategy(
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
);
