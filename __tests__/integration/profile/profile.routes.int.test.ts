import { validSearchKeyword, mockProfiles, loginMockUserProfile, invalidSearchKeyword } from "../../mocks/profile.mocks";
import { IUserProfile, UserProfile } from "../../../src/models/user/user-profile.model";
import supertest from "supertest";
import app from "../../../app";
import { faker } from "@faker-js/faker";

const request = supertest(app);
let token: string | undefined;

describe("/profile/profile.routes", () => {
    beforeEach(async () => {
        const loginUser = new UserProfile(loginMockUserProfile);
        await loginUser.save();

        token = loginUser.generateJWT();
    });

    describe("GET /search", () => {
        it("should return list of profiles with username containing the keyword", async () => {
            await UserProfile.insertMany(mockProfiles);

            const expectedUserNames = mockProfiles
                .filter((profile) => profile.userName.includes(validSearchKeyword))
                .map((profile) => profile.userName);

            const response = await request
                .get(`/profile/search?query=${validSearchKeyword}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body.length).toEqual(expectedUserNames.length);
            response.body.forEach((profile: IUserProfile) => {
                expect(expectedUserNames.includes(profile.userName)).toBe(true);
            });
        });

        it("should return empty if no usernames contain the keyword", async () => {
            await UserProfile.insertMany(mockProfiles);

            const response = await request
                .get(`/profile/search?query=${invalidSearchKeyword}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.length).toBe(0);
        });

        it("should return empty if no keyword is provided", async () => {
            await UserProfile.insertMany(mockProfiles);

            const response = await request
                .get(`/profile/search?query=`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.length).toBe(0);
        });

        it("should return 401 if no token provided", async () => {
            const response = await request
                .get(`/profile/search?query=`)
                .expect(401);
        });
    });

    describe("GET /:profileId", () => {
        it("should return the user with the profileId", async () => {
            await UserProfile.insertMany(mockProfiles);

            const user = await UserProfile.findOne().skip(Math.random() * mockProfiles.length);

            const response = await request
                .get(`/profile/${user?._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.id).toBeDefined();
            expect(response.body.id.toString()).toBe(user?._id.toString());
        });

        it("should return empty if the profileId does not exists", async () => {
            await UserProfile.insertMany(mockProfiles);

            const response = await request
                .get(`/profile/${faker.database.mongodbObjectId()}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body).toMatchObject({});
        });

        it("should return 401 if no token provided", async () => {
            await UserProfile.insertMany(mockProfiles);

            const user = await UserProfile.findOne().skip(Math.random() * mockProfiles.length);

            const response = await request
                .get(`/profile/${user?._id}`)
                .expect(401);
        });
    });
})