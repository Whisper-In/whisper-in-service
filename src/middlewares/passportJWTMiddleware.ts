import passport from "passport";

export const passpotJWTMiddleware = passport.authenticate("jwt", {
  session: false,
});
