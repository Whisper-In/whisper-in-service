import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware.js";
import * as userController from "../../controllers/user/user.controller.js";
import { profileUploadHandler } from "../../utils/multer.js";
import { multerUploadMiddleware } from "../../middlewares/multer.middleware.js";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.get("/", passportJWTMiddleware, userController.getUserProfile)
router.put("/", passportJWTMiddleware, userController.updateUserProfile)
router.put("/tnc", userController.updateUserTnC)
router.post("/subscription", passportJWTMiddleware, userController.createUserSubscription);
router.put("/avatar", [
    passportJWTMiddleware,
    multerUploadMiddleware(
        profileUploadHandler({ fileName: "avatar" }),
        "single",
        [{ name: "avatar", maxCount: 1 }]
    )],
    userController.updateUserAvatar);

//Use multer without storage to keep the file in the request and pass to elevenlabs api
router.put("/voice", [passportJWTMiddleware, upload.single("voice-sample")], userController.updateUserVoice);
router.post('/payment-sheet', passportJWTMiddleware, userController.createPaymentSheet);
router.post('/payment-subscription', passportJWTMiddleware, userController.createPaymentSubscription);
router.post('/cancel-subscription', passportJWTMiddleware, userController.cancelSubscription);
router.post("/follow", passportJWTMiddleware, userController.followUser)
router.delete("/follow", passportJWTMiddleware, userController.unfollowUser)

export default router;