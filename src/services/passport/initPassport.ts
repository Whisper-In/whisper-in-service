import { Express } from "express";
import passport from "passport";
import "./googleStrategy.js";
import "./appleStrategy.js";
import "./jwtStrategy.js";
import { GoogleMobileStrategy, GoogleWebStrategy } from "./googleStrategy.js";
import { AppleMobileStrategy, AppleWebStrategy } from "./appleStrategy.js";
import { JWTStrategy } from "./jwtStrategy.js";

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
