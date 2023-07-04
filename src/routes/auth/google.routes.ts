import express, { Request, Response } from "express";
import passport from "passport";
import { googleCallback } from "../../controllers/auth/google.controller.js";

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

export default router;
