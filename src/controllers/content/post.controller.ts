import { RequestHandler } from "express";
import * as postService from "../../services/content/post.service";
import { appScheme } from "../../config/app.config";

export const getPosts: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const { profileId, postType } = req.query;
        const pageIndex = parseInt(req.query.pageIndex?.toString() ?? "0");
        const itemsPerLoad = parseInt(req.query.itemsPerLoad?.toString() ?? "0");

        const results = await postService.getPosts(
            userId, profileId || userId,
            postType as string, pageIndex, itemsPerLoad
        );

        return res.status(200).send(results);
    } catch (error) {
        return res.status(400).json(error);
    }
}

export const createPost: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const { description } = req.body;
        const file = req.file;

        if (!file) {
            throw "No file was provided in the request.";
        }

        const result = await postService.createPost(userId, description, file);

        return res.status(201).send(result);
    } catch (error) {
        return res.status(400).json({ error });
    }
}

export const deletePost: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user['_id'];
        const postId = req.params.postId;

        const result = await postService.deletePost(userId, postId);

        return res.status(200).send(result);
    } catch (error) {
        return res.status(400).json({ error })
    }
}

export const getExplorePosts: RequestHandler = async (req, res, next) => {
    try {
        let size = req.query.size ? parseInt(req.query.size as string) : 18;

        const results = await postService.getExplorePosts(size);

        return res.status(200).send(results);
    } catch (error) {
        return res.status(400).send({ error });
    }
}

export const getRecommendedPosts: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const showFollowingOnly: boolean = req.query.showFollowingOnly == "true";
        let size = req.query.size ? parseInt(req.query.size as string) : 5;

        const results = await postService.getRecommendedPosts(userId, size, showFollowingOnly);

        return res.status(200).send(results);
    } catch (error) {
        return res.status(400).send({ error });
    }
}

export const likePost: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const { postId } = req.body;

        const results = await postService.likePost(userId, postId);

        return res.status(200).send(results);
    } catch (error) {
        return res.status(400).send({ error });
    }
}

export const viewPost: RequestHandler = async (req, res, next) => {
    try {
        const { postId } = req.params;

        return res.redirect(`${appScheme}://viewpost?postId=${postId}`);
    } catch (error) {
        return res.status(400).send({ error });
    }
}

export const getPostDetail: RequestHandler = async (req, res, next) => {
    try {
        const user: any = req.user;
        const userId = user["_id"];
        const { postId } = req.params;

        const result = await postService.getPostDetail(userId, postId);

        return res.status(200).send(result);
    } catch (error) {
        throw error;
    }
}