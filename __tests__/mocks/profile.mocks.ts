import { faker } from "@faker-js/faker";
import { IUserProfile } from "../../src/models/user/user-profile.model";
import { mongo } from "mongoose";

export type LoginProfile = {
    birthday: Date;
    id: string;
    email: string;
    displayName: string;
    picture: string;
}

const profileEmail = faker.internet.email();
export const googleMockProfile: LoginProfile = {
    birthday: faker.date.past(),
    id: profileEmail,
    email: profileEmail,
    displayName: faker.internet.userName(),
    picture: faker.internet.avatar()
}

export const mockLoginProfile: IUserProfile = {
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Tester",
    email: "tester@gmail.com",
    userName: "tester",
    aiDescription: faker.lorem.words(10),
    voiceId: faker.string.alphanumeric(10),
    voiceSampleURL: faker.internet.url(),
    characterPrompt: "",
    bio: faker.lorem.words(10),
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    isSubscriptionOn: true,
    stripeConnectedAccountId: faker.string.alphanumeric(),
    priceTiers: [{
        features: [],
        price: 2,
        tier: 0
    }]
}

export const validSearchKeyword = "ar";
export const invalidSearchKeyword = "abcd";
export const mockProfiles: IUserProfile[] = [{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Neo Starlight",
    email: "neo_starlight@gmail.com",
    userName: "neo_starlight",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Sparkle Ninja",
    email: "sparkleninja@gmail.com",
    userName: "sparkleninja",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Quantum Jester",
    email: "quantumjester@gmail.com",
    userName: "quantumjester",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Celestial Penguin",
    email: "celestialpenguin@gmail.com",
    userName: "celestialpenguin",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Crimson Voyager",
    email: "crimsonvoyager@gmail.com",
    userName: "crimsonvoyager",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Lunar Dreamer",
    email: "lunardreamer@gmail.com",
    userName: "lunardreamer",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Zephyr Panda",
    email: "zephyrpanda@gmail.com",
    userName: "zephyrpanda",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Velvet Stream",
    email: "velvetstream@gmail.com",
    userName: "velvetstream",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Nebula Whisper",
    email: "nebulawhisper@gmail.com",
    userName: "nebulawhisper",
    characterPrompt: "",
    priceTiers: []
},
{
    _id: faker.database.mongodbObjectId() as any,
    birthday: faker.date.past(),
    avatar: faker.internet.avatar(),
    gender: faker.person.gender(),
    name: "Mystic Dusk",
    email: "mysticdusk@gmail.com",
    userName: "mysticdusk",
    characterPrompt: "",
    priceTiers: []
}];