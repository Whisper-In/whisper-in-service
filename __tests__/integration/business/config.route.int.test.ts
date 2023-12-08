import supertest from "supertest";
import app from "../../../app";

const request = supertest(app);

describe("Business/Config Controller", () => {    
    describe("Get Configuration API", () => {
        it("should return subscription fee with 200", async () => {
            const response = await request
                .get("/configuration/MIN_SUBSCRIPTION_FEE")
                .set("content-type", "application/json")
                .expect(200);
            
            expect(response.body.configName).toBe("MIN_SUBSCRIPTION_FEE");
            expect(response.body).toHaveProperty("configValue");
        });

        it("should return subscription commission rate with 200", async () => {
            const response = await request
                .get("/configuration/SUBSCRIPTION_COMMISSION_RATE")
                .set("content-type", "application/json")
                .expect(200);

            expect(response.body.configName).toBe("SUBSCRIPTION_COMMISSION_RATE");
            expect(response.body).toHaveProperty("configValue");
        });

        it("should return base character prompt with 200", async () => {
            const response = await request
                .get("/configuration/BASE_CHARACTER_PROMPT")
                .set("content-type", "application/json")
                .expect(200);

            expect(response.body.configName).toBe("BASE_CHARACTER_PROMPT");            
            expect(response.body.configValue.length).toBeGreaterThan(0)
        });
    });
});