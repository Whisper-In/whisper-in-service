import { Express } from "express";
import passport from "passport";
import {Strategy as GoogleStrategy, VerifyCallback} from "passport-google-oauth2";
import "./googleStrategy.js";
import "./appleStrategy.js";
import "./jwtStrategy.js";

export const initPassport = (app:Express) => {
    app.use(passport.initialize());    
}


passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user:any, done) => done(null, user));
