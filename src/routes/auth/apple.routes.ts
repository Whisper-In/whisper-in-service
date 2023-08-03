import express from "express";
import passport from "passport";
import { appleCallback } from "../../controllers/auth/apple.controller.js";

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

export default router;