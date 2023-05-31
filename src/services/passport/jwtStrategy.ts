import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserProfile } from "../../models/user/user-profile.model.js";

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("x-auth-token"),
      secretOrKey: <string>process.env.JWT_SECRET,
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
