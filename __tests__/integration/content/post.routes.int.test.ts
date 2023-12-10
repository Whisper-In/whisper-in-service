import supertest from "supertest";
import { IUserProfile, IUserProfileMethods, UserProfile } from "../../../src/models/user/user-profile.model";
import { mockLoginProfile, mockProfiles } from "../../mocks/profile.mocks";
import app from "../../../app";
import { createMockPosts, mockPhotoPath, mockVideoPath } from "../../mocks/post.mocks";
import { Post, PostType } from "../../../src/models/content/post.model";
import { Document, Schema } from "mongoose";
import { faker } from "@faker-js/faker";
import { deleteAllFiles } from "../../../src/services/google-cloud/google-cloud.service";
import { googleStoragePostsBucketName, googleStorageProfileBucketName } from "../../../src/config/app.config";
import { UserFollowing } from "../../../src/models/user/user-following.model";
import { UserLikedPost } from "../../../src/models/content/user-liked-post.model";

const request = supertest(app);
let token: string | undefined;
let loginUser: Document<unknown, {}, IUserProfile> & Omit<IUserProfile & Required<{
    _id: Schema.Types.ObjectId;
}>, "generateJWT"> & IUserProfileMethods | undefined;

describe("/content/post.routes", () => {
    beforeEach(async () => {
        loginUser = new UserProfile(mockLoginProfile);
        await loginUser.save();

        token = loginUser.generateJWT();
    });

    afterAll(async () => {
        await deleteAllFiles(googleStoragePostsBucketName);
        await deleteAllFiles(googleStorageProfileBucketName);
    });

    describe("GET /posts", () => {
        it("should only return list of posts created by the provided profileId", async () => {
            await UserProfile.insertMany(mockProfiles);
            const creators = mockProfiles.map((profile) => profile._id);

            const mockPosts = createMockPosts(creators);
            await Post.insertMany(mockPosts);

            const randomIdx = Math.floor(Math.random() * (creators.length - 1));
            const profileId = creators[randomIdx].toString();

            const params = new URLSearchParams({
                profileId,
                postType: PostType[PostType.PHOTO],
                pageIndex: '0',
                itemsPerLoad: '3'
            });

            const response = await request
                .get(`/content/posts?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const post of response.body) {
                expect(post.creator?._id).toEqual(profileId);
            }
        });

        it("should only return list of posts created by the user if no profileId is provided", async () => {
            const mockPosts = createMockPosts([loginUser!._id]);
            await Post.insertMany(mockPosts);

            const profileId = loginUser?.id;

            const params = new URLSearchParams({
                profileId,
                postType: PostType[PostType.PHOTO],
                pageIndex: '0',
                itemsPerLoad: '3'
            });

            const response = await request
                .get(`/content/posts?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const post of response.body) {
                expect(post.creator?._id).toEqual(profileId);
            }
        });

        it("should only return list of posts based on the provided postType", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);

            const profileId = creator._id.toString();

            //Test photo type
            const params = new URLSearchParams({
                profileId,
                postType: PostType[PostType.PHOTO],
                pageIndex: '0',
                itemsPerLoad: '6'
            });

            let response = await request
                .get(`/content/posts?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const post of response.body) {
                expect(post.postType).toEqual(PostType[PostType.PHOTO]);
            }

            //Test video type
            params.set("postType", PostType[PostType.VIDEO]);

            response = await request
                .get(`/content/posts?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const post of response.body) {
                expect(post.postType).toEqual(PostType[PostType.VIDEO]);
            }
        });

        it("should return list of posts based on the limit", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);

            const profileId = creator._id.toString();

            const tempArray = Array.from(Array(6).keys());

            for (const itemsPerLoad of tempArray) {
                const params = new URLSearchParams({
                    profileId,
                    postType: PostType[PostType.PHOTO],
                    pageIndex: '0',
                    itemsPerLoad: itemsPerLoad.toString()
                });

                const response = await request
                    .get(`/content/posts?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                expect(response.body).toHaveLength(itemsPerLoad);
            }
        });

        it("should return list of posts based on the pageIndex", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);
            const allPosts = await Post.find({ creator, postType: PostType[PostType.PHOTO] }).sort({ createdAt: -1, _id: -1 });

            const profileId = creator._id.toString();

            const tempArray = Array.from(Array(3).keys());
            const itemsPerLoad = 2;

            for (const pageIndex of tempArray) {
                const params = new URLSearchParams({
                    profileId,
                    postType: PostType[PostType.PHOTO],
                    pageIndex: pageIndex.toString(),
                    itemsPerLoad: itemsPerLoad.toString()
                });

                const response = await request
                    .get(`/content/posts?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                const slice = allPosts.slice(pageIndex * itemsPerLoad, pageIndex * itemsPerLoad + itemsPerLoad).map((post) => post.id);
                const postIds = response.body.map((post: any) => post._id);

                expect(postIds).toHaveLength(slice.length);
                expect(postIds.every((id: string) => slice.includes(id))).toBeTruthy();
            }
        });

        it("should return empty list if the pageIndex is more than the max pageIndex", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);
            const allPosts = await Post.find({ creator, postType: PostType[PostType.PHOTO] }).sort({ createdAt: -1, _id: -1 });

            const profileId = creator._id.toString();
            const itemsPerLoad = 2;
            const totalPage = Math.ceil(allPosts.length / itemsPerLoad);

            const params = new URLSearchParams({
                profileId,
                postType: PostType[PostType.PHOTO],
                pageIndex: (totalPage + 1).toString(),
                itemsPerLoad: itemsPerLoad.toString()
            });

            const response = await request
                .get(`/content/posts?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveLength(0);
        });

        it("should return the required fields for each posts", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);

            const profileId = creator._id.toString();

            const tempArray = Array.from(Array(3).keys());
            const itemsPerLoad = 2;

            for (const pageIndex of tempArray) {
                const params = new URLSearchParams({
                    profileId,
                    postType: PostType[PostType.PHOTO],
                    pageIndex: pageIndex.toString(),
                    itemsPerLoad: itemsPerLoad.toString()
                });

                const response = await request
                    .get(`/content/posts?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                for (const post of response.body) {
                    expect(post).toHaveProperty("_id");
                    expect(post).toHaveProperty("postURL");
                    expect(post).toHaveProperty("postType");
                    expect(post).toHaveProperty("description");
                    expect(post).toHaveProperty("creator");
                    expect(post).toHaveProperty("isCreator");
                    expect(post).toHaveProperty("thumbnailURL");
                    expect(post).toHaveProperty("likeCount");
                    expect(post).toHaveProperty("isLiked");
                }
            }
        })

        it("should return the required fields of the creator's profile", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);

            const profileId = creator._id.toString();

            const tempArray = Array.from(Array(3).keys());
            const itemsPerLoad = 2;

            for (const pageIndex of tempArray) {
                const params = new URLSearchParams({
                    profileId,
                    postType: PostType[PostType.PHOTO],
                    pageIndex: pageIndex.toString(),
                    itemsPerLoad: itemsPerLoad.toString()
                });

                const response = await request
                    .get(`/content/posts?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                for (const post of response.body) {
                    expect(post.creator).toHaveProperty("_id");
                    expect(post.creator).toHaveProperty("userName");
                    expect(post.creator).toHaveProperty("avatar");
                    expect(post.creator).toHaveProperty("isFollowing");
                }
            }
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/content/posts`)
                .expect(401);
        });
    });

    describe("POST /posts", () => {
        it("should create a new post", async () => {
            const response = await request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.PHOTO])
                .attach("post", mockPhotoPath)
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body._id.length).toBeGreaterThan(0);
        });

        it("should create post for the requesting user only", async () => {
            const response = await request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.PHOTO])
                .attach("post", mockPhotoPath)
                .expect(201);

            expect(response.body.creator).toEqual(loginUser?.id);
        });

        it("should create the correct post type", async () => {
            const photoRequest = request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.PHOTO])
                .attach("post", mockPhotoPath)
                .expect(201);

            const videoRequest = request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.VIDEO])
                .attach("post", mockVideoPath)
                .expect(201);

            const responses = await Promise.all([photoRequest, videoRequest]);

            expect(responses[0].body.postType).toEqual(PostType[PostType.PHOTO]);
            expect(responses[1].body.postType).toEqual(PostType[PostType.VIDEO]);
        });

        it("should have optional description", async () => {
            const noDescriptionRequest = request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.PHOTO])
                .attach("post", mockPhotoPath)
                .expect(201);

            const description = faker.lorem.sentence(10)
            const descriptionRequest = request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.PHOTO])
                .field("description", description)
                .attach("post", mockPhotoPath)
                .expect(201);

            const responses = await Promise.all([noDescriptionRequest, descriptionRequest])

            expect(responses[0].body.description).toBeUndefined();
            expect(responses[1].body.description).toEqual(description);
        });

        it("should create a thumbnail for video posts", async () => {
            const response = await request
                .post(`/content/posts`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("postType", PostType[PostType.VIDEO])
                .attach("post", mockVideoPath)
                .expect(201);

            expect(response.body.thumbnailURL.length).toBeGreaterThan(0);
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .post(`/content/posts`)
                .expect(401);
        });
    });

    describe("DELETE /:postId", () => {
        it("should delete the post with the given postId", async () => {
            const mockPosts = createMockPosts([loginUser?.id]);
            const beforeDeletePosts = await Post.insertMany(mockPosts);

            const randomIdx = Math.floor(Math.random() * (beforeDeletePosts.length - 1));
            const deletePost = beforeDeletePosts[randomIdx];

            const response = await request
                .delete(`/content/posts/${deletePost._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            const afterDeletePosts = await Post.find({});

            expect(afterDeletePosts.length).toEqual(beforeDeletePosts.length - 1);
            expect(afterDeletePosts.find(p => p._id == deletePost._id)).toBeFalsy();
        });

        it("should only delete post created by the requesting user", async () => {
            const mockPosts = createMockPosts([faker.database.mongodbObjectId() as any]);
            const beforeDeletePosts = await Post.insertMany(mockPosts);

            const randomIdx = Math.floor(Math.random() * (beforeDeletePosts.length - 1));
            const deletePost = beforeDeletePosts[randomIdx];

            const response = await request
                .delete(`/content/posts/${deletePost._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            const post = await Post.exists({ _id: deletePost._id });
            expect(post?._id).toBeDefined();
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .delete(`/content/posts/test`)
                .expect(401);
        });
    });

    describe("GET /recommended", () => {
        it("should return random list of posts", async () => {
            const creators = await UserProfile.insertMany(mockProfiles);
            const mockPosts = createMockPosts(creators.map((c) => c._id));
            await Post.insertMany(mockPosts);

            const params = new URLSearchParams({
                size: '3'
            });

            let previousList: any[] = [];

            for (let i = 0; i < 3; i++) {
                const response = await request
                    .get(`/content/posts/recommended?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                expect(response.body.every((post: any) => previousList.includes(post._id))).toBeFalsy();

                previousList = response.body;
            };
        });

        it("should return list of posts based on the limit", async () => {
            const creators = await UserProfile.insertMany(mockProfiles);
            const mockPosts = createMockPosts(creators.map((c) => c._id));
            await Post.insertMany(mockPosts);

            for (let size = 0; size <= 3; size++) {
                const params = new URLSearchParams({
                    size: size.toString()
                });

                const response = await request
                    .get(`/content/posts/recommended?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                expect(response.body).toHaveLength(size);
            };
        });

        it("should return list of posts from followings if the showFollowingOnly flag is true", async () => {
            const creators = await UserProfile.insertMany(mockProfiles);
            const followed = creators[0];

            await UserFollowing.insertMany([{
                followedUserId: followed._id,
                userId: loginUser?._id
            }]);

            const mockPosts = createMockPosts(creators.map((c) => c._id));
            await Post.insertMany(mockPosts);

            const followedPosts = await Post.find({ creator: followed._id });
            const followedPostIds = followedPosts.map((p) => p.id);

            const params = new URLSearchParams({
                size: '12',
                showFollowingOnly: 'true'
            });

            const response = await request
                .get(`/content/posts/recommended?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body.every((post: any) => followedPostIds.includes(post._id))).toBeTruthy();
        });

        it("should return the required fields for each posts", async () => {
            const creator = mockProfiles[0];
            await UserProfile.insertMany(creator);

            const mockPosts = createMockPosts([creator._id]);
            await Post.insertMany(mockPosts);

            const params = new URLSearchParams({
                size: '12'
            });

            const response = await request
                .get(`/content/posts/recommended?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const post of response.body) {
                expect(post).toHaveProperty("_id");
            }
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/content/posts/recommended`)
                .expect(401);
        });
    });

    describe("POST /like", () => {
        it("should insert a new record to UserLikedPosts", async () => {
            const mockPosts = createMockPosts([faker.database.mongodbObjectId() as any]);
            const posts = await Post.insertMany(mockPosts);
            const idx = Math.floor(Math.random() * (posts.length - 1));
            const post = posts[idx];

            const response = await request
                .post("/content/posts/like")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    postId: post._id
                })
                .expect(200);

            const likedPost = await UserLikedPost.exists({
                postId: post._id,
                userId: loginUser?._id
            });

            expect(likedPost?._id).toBeDefined();
        });

        it("should remove the record from UserLikedPosts if the post was already liked", async () => {
            const mockPosts = createMockPosts([faker.database.mongodbObjectId() as any]);
            const posts = await Post.insertMany(mockPosts);
            const idx = Math.floor(Math.random() * (posts.length - 1));
            const post = posts[idx];

            const likedPost = new UserLikedPost({
                postId: post._id,
                userId: loginUser?._id
            });

            await likedPost.save();

            const response = await request
                .post("/content/posts/like")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    postId: post._id
                })
                .expect(200);

            const exists = await UserLikedPost.exists({ _id: likedPost._id });

            expect(exists?._id).toBeUndefined();
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .post("/content/posts/like")
                .expect(401);
        });
    });

    describe("GET /details/:postId", () => {
        it("should return the required fields", async () => {
            const creator = new UserProfile(mockProfiles[0]);
            await creator.save();

            const mockPosts = createMockPosts([creator._id]);
            const posts = await Post.insertMany(mockPosts);
            const idx = Math.floor(Math.random() * (posts.length - 1));
            const post = posts[idx]

            const response = await request
                .get(`/content/posts/details/${post._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty("postURL");
            expect(response.body).toHaveProperty("postType");
            expect(response.body).toHaveProperty("description");
            expect(response.body).toHaveProperty("creator");
            expect(response.body).toHaveProperty("isCreator");
            expect(response.body).toHaveProperty("thumbnailURL");
            expect(response.body).toHaveProperty("likeCount");
            expect(response.body).toHaveProperty("postURL");
            expect(response.body).toHaveProperty("isLiked");

            expect(response.body.creator).toHaveProperty("_id");
            expect(response.body.creator).toHaveProperty("userName");
            expect(response.body.creator).toHaveProperty("avatar");
            expect(response.body.creator).toHaveProperty("isFollowing");
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/content/posts/details/test`)
                .expect(401);
        });
    });
});