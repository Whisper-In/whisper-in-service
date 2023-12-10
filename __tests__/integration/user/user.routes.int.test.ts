import supertest from "supertest";
import { IUserProfile, IUserProfileMethods, TierChatFeature, UserProfile } from "../../../src/models/user/user-profile.model";
import { mockLoginProfile, mockProfiles } from "../../mocks/profile.mocks";
import app from "../../../app";
import { Document, Schema } from "mongoose";
import { createMockPosts, mockPhotoPath } from "../../mocks/post.mocks";
import { Post } from "../../../src/models/content/post.model";
import { UserFollowing } from "../../../src/models/user/user-following.model";
import { UserLikedPost } from "../../../src/models/content/user-liked-post.model";
import { faker } from "@faker-js/faker";
import { BusinessConfig } from "../../../src/models/business/business-configs.model";
import { SubscriptionStatus, UserSubscription } from "../../../src/models/user/user-subscriptions.model";
import { deleteAllFiles, fileExists } from "../../../src/services/google-cloud/google-cloud.service";
import { googleStoragePostsBucketName, googleStorageProfileBucketName } from "../../../src/config/app.config";
import { getSubscription } from "../../../src/services/payment/payment.services";
import Stripe from "stripe";

const request = supertest(app);
let token: string | undefined;
let loginUser: Document<unknown, {}, IUserProfile> & Omit<IUserProfile & Required<{
    _id: Schema.Types.ObjectId;
}>, "generateJWT"> & IUserProfileMethods | undefined;


describe("/user/user.routes", () => {
    beforeEach(async () => {
        loginUser = new UserProfile(mockLoginProfile);
        await loginUser.save();

        token = loginUser.generateJWT();
    });

    describe("GET /", () => {
        it("should return the user profile with the required fields and correct values", async () => {
            const followers = await UserProfile.insertMany(mockProfiles);
            const mockPosts = await createMockPosts([loginUser?.id]);
            const posts = await Post.insertMany(mockPosts);

            await UserFollowing.insertMany(followers.map((follower) => ({
                userId: follower._id,
                followedUserId: loginUser?._id
            })));

            const likes = await UserLikedPost.insertMany(posts.map((post) =>
                followers.map((follower) => ({
                    userId: follower._id,
                    postId: post._id
                }))
            ).flat());

            const response = await request
                .get("/user")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body._id).toEqual(loginUser?.id)
            expect(response.body.name).toEqual(loginUser?.name);
            expect(response.body.userName).toEqual(loginUser?.userName);
            expect(response.body.avatar).toContain(loginUser?.avatar);
            expect(response.body.email).toEqual(loginUser?.email);
            expect(JSON.stringify(response.body.priceTiers)).toEqual(JSON.stringify(loginUser!.priceTiers));
            expect(response.body.bio).toEqual(loginUser?.bio);
            expect(response.body.instagram).toEqual(loginUser?.instagram);
            expect(response.body.youtube).toEqual(loginUser?.youtube);
            expect(response.body.isSubscriptionOn).toEqual(loginUser?.isSubscriptionOn);
            expect(response.body.stripeConnectedAccountId).toEqual(loginUser?.stripeConnectedAccountId);
            expect(response.body.aiDescription).toEqual(loginUser?.aiDescription);
            expect(response.body.voiceId).toEqual(loginUser?.voiceId);
            expect(response.body.voiceSampleURL).toEqual(loginUser?.voiceSampleURL);
            expect(response.body.followerCount).toEqual(followers.length);
            expect(response.body.postCount).toEqual(posts.length);
            expect(response.body.totalLikeCount).toEqual(likes.length);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .get("/user")
                .expect(401);
        });
    })

    describe("PUT /", () => {
        it("should update the user profile only the updatable fields", async () => {
            const minSubscriptionFee = await BusinessConfig.findOne({
                configName: "MIN_SUBSCRIPTION_FEE"
            });

            const update: IUserProfile = {
                _id: loginUser?.id,
                birthday: faker.date.past(),
                characterPrompt: "",
                email: faker.internet.email(),
                name: faker.person.fullName(),
                userName: faker.internet.userName(),
                aiDescription: faker.lorem.text(),
                avatar: faker.internet.url(),
                bio: faker.lorem.text(),
                instagram: faker.internet.url(),
                youtube: faker.internet.url(),
                voiceId: faker.string.alphanumeric(),
                voiceSampleURL: faker.internet.url(),
                gender: faker.person.gender(),
                isSubscriptionOn: true,
                priceTiers: [{
                    features: [TierChatFeature[TierChatFeature.AUDIO]],
                    price: Math.round(Math.random() * 10 + parseInt(minSubscriptionFee?.configValue || "0")),
                    tier: 0
                }]
            };

            const response = await request
                .put("/user")
                .set("Authorization", `Bearer ${token}`)
                .send(update)
                .expect(200);

            expect(response.body._id).toBe(loginUser?.id);
            expect(response.body.birthday).toBe(update.birthday.toISOString());
            expect(response.body.email).toBe(loginUser?.email);
            expect(response.body.name).toBe(update.name);
            expect(response.body.userName).toBe(update.userName.toLowerCase());
            expect(response.body.aiDescription).toBe(update.aiDescription);
            expect(response.body.avatar).toBe(loginUser?.avatar);
            expect(response.body.bio).toBe(update.bio);
            expect(response.body.instagram).toBe(update.instagram);
            expect(response.body.youtube).toBe(update.youtube);
            expect(response.body.voiceId).toBe(loginUser?.voiceId);
            expect(response.body.voiceSampleURL).toBe(loginUser?.voiceSampleURL);
            expect(response.body.gender).toBe(update.gender);
            expect(response.body.priceTiers).toMatchObject(update.priceTiers);
        });

        it("should update the priceTier price to the minSubscriptionFee", async () => {
            const minSubscriptionFee = await BusinessConfig.findOne({
                configName: "MIN_SUBSCRIPTION_FEE"
            });

            const update = {
                _id: loginUser?.id,
                isSubscriptionOn: true,
                priceTiers: [{
                    features: [TierChatFeature[TierChatFeature.AUDIO]],
                    price: 0,
                    tier: 0
                }]
            };

            const response = await request
                .put("/user")
                .set("Authorization", `Bearer ${token}`)
                .send(update)
                .expect(200);

            const expectedPriceTiers = [{
                features: [TierChatFeature[TierChatFeature.AUDIO]],
                price: parseInt(minSubscriptionFee?.configValue || "0"),
                tier: 0
            }];

            expect(response.body.priceTiers).toMatchObject(expectedPriceTiers);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .put("/user")
                .expect(401);
        });
    })

    describe("POST /subscription", () => {
        it("should insert a new user subscription", async () => {
            const mockProfile = mockProfiles[0];
            mockProfile.priceTiers = [{
                features: [],
                price: 10,
                tier: 0
            }]

            const profile = new UserProfile(mockProfile);
            await profile.save();

            const response = await request
                .post("/user/subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    subscriptionId: faker.string.alphanumeric(10),
                    tier: 0
                })
                .expect(201);

            const newSubscription = await UserSubscription.exists({
                subscribedUserId: profile._id,
                userId: loginUser?._id,
            });

            expect(newSubscription?._id).toBeTruthy();
        });

        it("should update existing user subscription if user was subscribed before", async () => {
            const profileId = faker.database.mongodbObjectId()
            const subscription = new UserSubscription({
                subscribedUserId: profileId,
                userId: loginUser?._id,
                tier: 0,
                status: SubscriptionStatus[SubscriptionStatus.DELETED],
                expiryDate: faker.date.future(),
                stripeSubscriptionId: faker.string.alphanumeric(10)
            });

            subscription.save();

            const response = await request
                .post("/user/subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId,
                    subscriptionId: faker.string.alphanumeric(10),
                    tier: 0
                })
                .expect(201);

            const update = await UserSubscription.findById(subscription._id);

            //*In production this should be PENDING and only be updated to SUCCEEDED when stripe calls the web hook
            expect(update?.status).toBe(SubscriptionStatus[SubscriptionStatus.SUCCEEDED])
        });

        it("it should fail if no stripeSubscriptionId was provided and the fee is more than 0", async () => {
            const mockProfile = mockProfiles[0];
            mockProfile.priceTiers = [{
                features: [],
                price: 10,
                tier: 0
            }]

            const profile = new UserProfile(mockProfile);
            await profile.save();

            const response = await request
                .post("/user/subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                })
                .expect(400);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .post("/user/subscription")
                .expect(401);
        });
    })

    describe("PUT /avatar", () => {
        afterAll(async () => {
            await deleteAllFiles(googleStoragePostsBucketName);
            await deleteAllFiles(googleStorageProfileBucketName);
        });

        it("should update the avatar", async () => {
            const response = await request
                .put("/user/avatar")
                .set("Authorization", `Bearer ${token}`)
                .attach("avatar", mockPhotoPath)
                .expect(200);

            const user = await UserProfile.findById(loginUser?._id);

            expect(user?.avatar).not.toEqual(loginUser?.avatar);
        });

        it("should upload the new file to google storage", async () => {
            const response = await request
                .put("/user/avatar")
                .set("Authorization", `Bearer ${token}`)
                .attach("avatar", mockPhotoPath)
                .expect(200);

            const user = await UserProfile.findById(loginUser?._id);

            const exists = fileExists(googleStorageProfileBucketName, user?.avatar);

            expect(exists).toBeTruthy();
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .put("/user/avatar")
                .expect(401);
        });
    })

    describe("POST /payment-sheet", () => {
        it("should return the payment intent", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-sheet")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 1
                })
                .expect(200);

            expect(response.body).toHaveProperty("paymentIntent");
            expect(response.body).toHaveProperty("ephemeralKey");
            expect(response.body).toHaveProperty("customer");
            expect(response.body).toHaveProperty("publishableKey");
        });

        it("should update the user's stripeCustomerId if it does not exists", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-sheet")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 1
                })
                .expect(200);

            const updatedUser = await UserProfile.findById(loginUser?._id);
            expect(updatedUser?.stripeCustomerId).toEqual(response.body.customer);
        });

        it("should return 404 if no profileId was provided", async () => {
            const response = await request
                .post("/user/payment-sheet")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    tier: 0
                })
                .expect(404);
        });

        it("should return 404 if the price tier is invalid", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-sheet")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 0
                })
                .expect(404);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .post("/user/payment-sheet")
                .expect(401);
        });
    })

    describe("POST /payment-subscription", () => {
        it("should return the payment intent", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 1
                })
                .expect(200);

            expect(response.body).toHaveProperty("subscriptionId");
            expect(response.body).toHaveProperty("paymentIntent");
            expect(response.body).toHaveProperty("ephemeralKey");
            expect(response.body).toHaveProperty("customer");
            expect(response.body).toHaveProperty("publishableKey");
        });

        it("should update the user's stripeCustomerId if it does not exists", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 1
                })
                .expect(200);

            const updatedUser = await UserProfile.findById(loginUser?._id);
            expect(updatedUser?.stripeCustomerId).toEqual(response.body.customer);
        });

        it("should return 404 if no profileId was provided", async () => {
            const response = await request
                .post("/user/payment-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    tier: 0
                })
                .expect(404);
        });

        it("should return 404 if the price tier is invalid", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 1
            }];

            await profile.save();

            const response = await request
                .post("/user/payment-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 0
                })
                .expect(404);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .post("/user/payment-subscription")
                .expect(401);
        });
    })

    describe("POST /cancel-subscription", () => {
        it("should update user subscription status to DELETED", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 0,
                tier: 0
            }];

            await profile.save();

            const subscription = new UserSubscription({
                status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED],
                subscribedUserId: profile._id,
                tier: 0,
                userId: loginUser?._id
            });

            await subscription.save();

            const response = await request
                .post("/user/cancel-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id
                })
                .expect(200);

            const updatedSubscription = await UserSubscription.findById(subscription._id);

            expect(updatedSubscription?.status).toEqual(SubscriptionStatus[SubscriptionStatus.DELETED]);
        });

        it("should cancel stripe subcription if the subscription has stripeSubscriptionId", async () => {
            const mockProfile = mockProfiles[0];

            const profile = new UserProfile(mockProfile);
            profile.priceTiers = [{
                features: [],
                price: 10,
                tier: 0
            }];

            await profile.save();

            const paymentSubscriptionResponse = await request
                .post("/user/payment-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    tier: 0
                })
                .expect(200);

            const paymentIntent = paymentSubscriptionResponse.body;

            const subscription = new UserSubscription({
                status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED],
                subscribedUserId: profile._id,
                tier: 0,
                userId: loginUser?._id,
                stripeSubscriptionId: paymentIntent.subscriptionId
            });

            await subscription.save();

            const response = await request
                .post("/user/cancel-subscription")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile.id
                })
                .expect(200);

            const stripeSubscription = await getSubscription(paymentIntent.subscriptionId);
            //For testing with incomplete payment, this means stripe was canceled
            expect(stripeSubscription?.status).toEqual("incomplete_expired");
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .post("/user/cancel-subscription")
                .expect(401);
        });
    })

    describe("POST /follow/:profileId", () => {
        it("should create a new following record", async () => {
            const followedId = faker.database.mongodbObjectId();

            const response = await request
                .post(`/user/follow/${followedId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(201);

            const exists = await UserFollowing.exists({
                followedUserId: followedId,
                userId: loginUser?._id
            });

            expect(exists?._id).toBeTruthy();
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .post("/user/follow/test")
                .expect(401);
        });
    })

    describe("DELETE /follow/:profileId", () => {
        it("should remove a following record", async () => {
            const followedId = faker.database.mongodbObjectId();

            const userFollowing = new UserFollowing({
                followedUserId: followedId,
                userId: loginUser?._id
            });

            await userFollowing.save();

            const response = await request
                .delete(`/user/follow/${followedId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            const exists = await UserFollowing.exists({
                followedUserId: followedId,
                userId: loginUser?._id
            });

            expect(exists?._id).toBeFalsy();
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .delete("/user/follow/test")
                .expect(401);
        });
    })
});
