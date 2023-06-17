import passport from "passport";

export const passportJWTMiddleware = passport.authenticate("jwt", {
  session: false,
});
