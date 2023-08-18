import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passportJWTMiddleware.js";
import * as postController from "../../controllers/content/post.controller.js";
import MulterGoogleCloudStorage from "multer-google-storage";
import multer from "multer";
import { googleCloudKeyFileName, googleStoragePostsBucketName } from "../../config/app.config.js";
import path from "path";
import gcpKeyJson from "../../../resources/gcp-key.json" assert {type: "json"};

const uploadHandler = multer({
    storage: MulterGoogleCloudStorage.storageEngine({
        autoRetry: true,
        bucket: googleStoragePostsBucketName,
        projectId: gcpKeyJson.project_id,
        keyFilename: path.join(process.cwd(), 'resources', googleCloudKeyFileName),
        filename: (req: any, file: any, cb: any) => {
            cb(null, `${Date.now()}_${file.originalname}`);
        }
    })
})

const router = express();

router.get("/", passportJWTMiddleware, postController.getPosts);

router.post("/createPost", [passportJWTMiddleware, uploadHandler.single('post')], postController.createAIPost);

router.get("/explore", passportJWTMiddleware, postController.getExplorePosts);

router.get("/recommended", passportJWTMiddleware, postController.getRecommendedPosts
    /* 
    #swagger.parameters['size'] = {
            in: 'query',
            type: 'number'            
    }

    #swagger.parameters['showFollowingOnly'] = {
            in: 'query',
            type: 'boolean'            
    }
    */
);

router.post("/like", passportJWTMiddleware, postController.likePost);

export default router;