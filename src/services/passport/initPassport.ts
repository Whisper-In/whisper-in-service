import { Express } from "express";
import passport from "passport";
import "./googleStrategy";
import "./appleStrategy";
import "./jwtStrategy";
import { GoogleMobileStrategy, GoogleWebStrategy } from "./googleStrategy";
import { AppleMobileStrategy, AppleWebStrategy } from "./appleStrategy";
import { JWTStrategy } from "./jwtStrategy";

export const initPassport = (app:Express) => {
    app.use(passport.initialize());    
}

passport.use("apple", AppleMobileStrategy);
passport.use("apple-web", AppleWebStrategy);
passport.use("google", GoogleMobileStrategy);
passport.use("google-web", GoogleWebStrategy);
passport.use("jwt", JWTStrategy);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user:any, done) => done(null, user));
