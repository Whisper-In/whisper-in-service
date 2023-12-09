import express from "express";
import passport from "passport";
import { appleCallback, appleWebCallback } from "../../controllers/auth/apple.controller";

const router = express.Router();

router.get(
  "/login",
  passport.authenticate("apple")
  //#swagger.tags = ['Apple']
);

router.post(
  "/callback",
  passport.authenticate("apple", { session: false }),
  appleCallback
);

router.get(
  "/web/login",
  passport.authenticate("apple-web")
  //#swagger.tags = ['Google']
);

router.post(
  "/web/callback",
  passport.authenticate("apple-web", { session: false }),
  appleWebCallback
);

export default router;