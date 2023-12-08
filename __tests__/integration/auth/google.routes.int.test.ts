import supertest from "supertest";
import app from "../../../app";
import passport from "passport";
import MockStrategy from "../../../src/services/passport/mockStrategy";
import { googleVerification } from "../../../src/services/passport/googleStrategy";
import * as loginProfile from "../../mocks/profile.mocks";
import { appCallbackURL, frontendOrigin, googleWebCallbackURL } from "../../../src/config/app.config";

const request = supertest(app);

describe("/auth/google.routes", () => {
    describe("GET /auth/google/web/callback", () => {
        it("should redirect with the user and jwtToken", async () => {
            passport.use(new MockStrategy("google-web", (done) => googleVerification("", "", loginProfile.googleMockProfile, done)));

            const response = await request
                .get("/auth/google/web/callback")
                .expect(302)
                .expect("Location", new RegExp(`^${frontendOrigin}${appCallbackURL}\\?user=.+&token=.+$`, "g"));
        });

        it("should return 401 if no user returned from google", async () => {
            passport.use(new MockStrategy("google-web", (done) => googleVerification("", "", null, done)));

            const response = await request
                .get("/auth/google/web/callback")
                .expect(401);
        });
    });
});