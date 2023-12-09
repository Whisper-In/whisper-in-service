import express from "express";
import { passportJWTMiddleware } from "../../middlewares/passport-jwt.middleware";
import * as postController from "../../controllers/content/post.controller";
import { postUploadHandler } from "../../utils/multer";
import { multerUploadMiddleware } from "../../middlewares/multer.middleware";

const router = express();

router.get("/", passportJWTMiddleware, postController.getPosts);

router.post("/", [passportJWTMiddleware, multerUploadMiddleware(
        postUploadHandler,
        "single",
        [{ name: "post", maxCount: 1 }]
)], postController.createPost);

router.delete("/:postId", passportJWTMiddleware, postController.deletePost);

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

router.get("/view-post/:postId", postController.viewPost);

router.get("/details/:postId", passportJWTMiddleware, postController.getPostDetail);

export default router;