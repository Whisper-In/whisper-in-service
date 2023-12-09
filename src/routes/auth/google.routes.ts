import express, { Request, Response } from "express";
import passport from "passport";
import { googleCallback, googleWebCallback } from "../../controllers/auth/google.controller";
import { googleWebCallbackURL } from "../../config/app.config";

const router = express.Router();

router.get(
  "/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
  //#swagger.tags = ['Google']
);

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

router.get(
  "/web/login",
  passport.authenticate("google-web", { scope: ["profile", "email"] })
  //#swagger.tags = ['Google']
);

router.get(
  "/web/callback",
  passport.authenticate("google-web", { session: false }),
  googleWebCallback
);


export default router;
