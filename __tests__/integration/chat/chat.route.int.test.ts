import supertest from "supertest";
import app from "../../../app";
import { Document, Schema, Types } from "mongoose";
import { IUserProfile, IUserProfileMethods, UserProfile } from "../../../src/models/user/user-profile.model";
import { mockLoginProfile, mockProfiles } from "../../mocks/profile.mocks";
import { Chat } from "../../../src/models/chat/chat.model";
import { faker } from "@faker-js/faker";
import { ChatMessage } from "../../../src/models/chat/chat-message.model";
import { ERROR_MESSAGE, SUBSCRIPTION_PROMPT } from "../../../src/config/chatgpt.config";
import { SubscriptionStatus, UserSubscription } from "../../../src/models/user/user-subscriptions.model";
import * as chatGPTService from "../../../src/services/chatgpt/chatgpt.services";
import { createMockMessages } from "../../mocks/chat.mocks";

const request = supertest(app);
let token: string | undefined;
let loginUser: Document<unknown, {}, IUserProfile> & Omit<IUserProfile & Required<{
    _id: Schema.Types.ObjectId;
}>, "generateJWT"> & IUserProfileMethods | undefined;


const TEST_CHATGPT_MESSAGE = "Test ChatGPT Message";
jest.spyOn(chatGPTService, "getChatCompletion")
    .mockImplementation(async (profileId, message, prevMessages) => new Promise((resolve) => resolve({
        content: TEST_CHATGPT_MESSAGE,
        role: "assistant"
    })))

describe("/chat/chat.routes", () => {
    beforeEach(async () => {
        loginUser = new UserProfile(mockLoginProfile);
        await loginUser.save();

        token = loginUser.generateJWT();
    });

    describe("GET /:chatId", () => {
        it("should return the required fields", async () => {
            const mockProfile = mockProfiles[0];
            const profile = new UserProfile(mockProfile);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile },
                    { profile: loginUser?._id }
                ],
            });

            await chat.save();

            const response = await request
                .get(`/chats/${chat._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty("chatId");
            expect(response.body).toHaveProperty("profile");
            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");

            expect(response.body.profile).toHaveProperty("_id");
            expect(response.body.profile).toHaveProperty("name");
            expect(response.body.profile).toHaveProperty("avatar")
        });

        it("should prevent user from retrieving chats that do not involve the user", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: faker.database.mongodbObjectId() },
                    { profile: faker.database.mongodbObjectId() }
                ],
            });

            await chat.save();

            const response = await request
                .get(`/chats/${chat._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body).toBeFalsy();
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/chats/test`)
                .expect(401);
        });
    });

    describe("GET /user-chats/chats", () => {
        it("should return list of user's chats with the required fields", async () => {
            const mockProfile = mockProfiles[0];
            const profile = new UserProfile(mockProfile);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile },
                    { profile: loginUser?._id }
                ],
            });

            await chat.save();

            const chatMessage = new ChatMessage({
                chatId: chat._id,
                message: faker.lorem.text(),
                sender: loginUser?._id
            });

            await chatMessage.save();

            const response = await request
                .get(`/chats/user-chats/chats`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const chat of response.body) {
                expect(chat).toHaveProperty("chatId");
                expect(chat).toHaveProperty("lastMessage");
                expect(chat).toHaveProperty("profile");

                expect(chat.profile).toHaveProperty("_id");
                expect(chat.profile).toHaveProperty("userName");
                expect(chat.profile).toHaveProperty("avatar");

                expect(chat.lastMessage).toHaveProperty("message");
                expect(chat.lastMessage).toHaveProperty("createdAt");
            }
        });

        it("should return the last message that was added", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: loginUser?._id }
                ],
            });

            await chat.save();

            const chatMessages = await ChatMessage.insertMany([
                {
                    chatId: chat._id,
                    message: faker.lorem.text(),
                    sender: loginUser?._id
                },
                {
                    chatId: chat._id,
                    message: faker.lorem.text(),
                    sender: loginUser?._id
                },
                {
                    chatId: chat._id,
                    message: faker.lorem.text(),
                    sender: loginUser?._id
                },
                {
                    chatId: chat._id,
                    message: faker.lorem.text(),
                    sender: loginUser?._id
                },
                {
                    chatId: chat._id,
                    message: faker.lorem.text(),
                    sender: loginUser?._id
                }
            ]);

            const response = await request
                .get(`/chats/user-chats/chats`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            for (const chat of response.body) {
                expect(chat.lastMessage._id).toEqual(chatMessages[chatMessages.length - 1].id);
            }
        })

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/chats/user-chats/chats`)
                .expect(401);
        });
    });

    describe("POST /user-chats/new-chat", () => {
        it("should create a new chat for the user", async () => {
            const profileId = faker.database.mongodbObjectId();

            const response = await request
                .post(`/chats/user-chats/new-chat`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId
                })
                .expect(201);

            const newChat = await Chat.exists({
                "profiles.profile": {
                    $all: [loginUser?.id, profileId]
                }
            });

            expect(newChat?._id).toBeTruthy();
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .post(`/chats/user-chats/new-chat`)
                .expect(401);
        });
    });

    describe("POST /chat-completion", () => {
        it("should return a subscription prompt if user is not subscribe", async () => {
            const mockProfile = mockProfiles[0];
            const profile = new UserProfile(mockProfile);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile: profile._id },
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const response = await request
                .post(`/chats/chat-completion`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    chatId: chat._id
                })
                .expect(200);

            expect(response.body.message).toEqual(SUBSCRIPTION_PROMPT);
        });

        it("should return a message from ChatGPT", async () => {
            const mockProfile = mockProfiles[0];
            const profile = new UserProfile(mockProfile);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile: profile._id },
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const subscription = new UserSubscription({
                subscribedUserId: profile._id,
                userId: loginUser?._id,
                status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED],
                tier: 0
            });
            await subscription.save();

            const response = await request
                .post(`/chats/chat-completion`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    chatId: chat._id
                })
                .expect(200);

            expect(response.body.message.length).toBeGreaterThan(0);
            expect(response.body.message).toEqual(TEST_CHATGPT_MESSAGE);
        });

        it("should insert a new chat message record", async () => {
            const mockProfile = mockProfiles[0];
            const profile = new UserProfile(mockProfile);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile: profile._id },
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const subscription = new UserSubscription({
                subscribedUserId: profile._id,
                userId: loginUser?._id,
                status: SubscriptionStatus[SubscriptionStatus.SUCCEEDED],
                tier: 0
            });
            await subscription.save();

            const response = await request
                .post(`/chats/chat-completion`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profileId: profile._id,
                    chatId: chat._id
                })
                .expect(200);

            const lastChatMessage = await ChatMessage.findOne({
                chatId: chat._id
            }).sort({
                _id: -1,
                createdAt: -1
            });

            expect(response.body._id).toEqual(lastChatMessage?.id);
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .post(`/chats/chat-completion`)
                .expect(401);
        });
    });

    describe("POST /chat-messages/message", () => {
        it("should insert a new chat message", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const response = await request
                .post(`/chats/chat-messages/message`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    chatId: chat._id,
                    message: "Test message"
                })
                .expect(201);

            const lastChatMessage = await ChatMessage.findOne({
                chatId: chat._id
            }).sort({
                _id: -1,
                createdAt: -1
            });

            expect(response.body._id).toEqual(lastChatMessage?.id);
        });

        it("should not insert if the chat does not involve the user", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: faker.database.mongodbObjectId() }
                ],
            });
            await chat.save();

            const response = await request
                .post(`/chats/chat-messages/message`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    chatId: chat._id,
                    message: "Test message"
                })
                .expect(400);
        });

        it("should use the senderId provided in the body", async () => {
            const profile = new UserProfile(mockProfiles[0]);
            await profile.save();

            const chat = new Chat({
                profiles: [
                    { profile: profile._id }
                ],
            });
            await chat.save();

            const response = await request
                .post(`/chats/chat-messages/message`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    chatId: chat._id,
                    senderId: profile._id,
                    message: "Test message"
                })
                .expect(201);

            expect(response.body.sender).toEqual(profile.id);
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .post(`/chats/chat-messages/message`)
                .expect(401);
        });
    });

    describe("GET /chat-messages/:chatId", () => {
        it("should return list of chat messages", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const mockMessages = createMockMessages(20, chat._id, loginUser?._id);
            const messages = await ChatMessage.insertMany(mockMessages);

            const messageCount = 10;
            const params = new URLSearchParams({
                pageIndex: '0',
                messageCount: messageCount.toString()
            });

            const response = await request
                .get(`/chats/chat-messages/${chat._id}?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            const expectedMessages = messages.slice(-messageCount).map((m) => m.id);
            expect(response.body.messages).toHaveLength(messageCount);
            for (const message of response.body.messages) {
                expect(expectedMessages).toContain(message.messageId);
            }
        });

        it("should return based on the pageIndex", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const mockMessages = createMockMessages(20, chat._id, loginUser?._id);
            const messages = await ChatMessage.insertMany(mockMessages);

            const messageCount = 5;
            for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
                const params = new URLSearchParams({
                    pageIndex: pageIndex.toString(),
                    messageCount: messageCount.toString()
                });

                const response = await request
                    .get(`/chats/chat-messages/${chat._id}?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                const expectedMessages = messages
                    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0) || b.id.localeCompare(a.id))
                    .slice(pageIndex * messageCount, pageIndex * messageCount + messageCount)
                    .map((m) => m.id)
                    .sort();

                const resultMessages = response.body.messages
                    .map((m: any) => m.messageId)
                    .sort();

                expect(resultMessages).toEqual(expectedMessages)
            }
        });

        it("should return based on the limit", async () => {
            const chat = new Chat({
                profiles: [
                    { profile: loginUser?._id }
                ],
            });
            await chat.save();

            const mockMessages = createMockMessages(20, chat._id, loginUser?._id);
            const messages = await ChatMessage.insertMany(mockMessages);

            for (let messageCount = 0; messageCount <= 5; messageCount++) {
                const params = new URLSearchParams({
                    pageIndex: '0',
                    messageCount: messageCount.toString()
                });

                const response = await request
                    .get(`/chats/chat-messages/${chat._id}?${params}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                expect(response.body.messages).toHaveLength(messageCount);
            }
        });

        it("should not return messages from chat that does involve the requesting user", async () => {
            const profileId = faker.database.mongodbObjectId();
            const chat = new Chat({
                profiles: [
                    { profile: profileId }
                ],
            });
            await chat.save();

            const mockMessages = createMockMessages(20, chat._id, profileId);
            const messages = await ChatMessage.insertMany(mockMessages);

            const params = new URLSearchParams({
                pageIndex: '0',
                messageCount: '5'
            });

            const response = await request
                .get(`/chats/chat-messages/${chat._id}?${params}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.messages).toHaveLength(0);
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request
                .get(`/chats/chat-messages/test`)
                .expect(401);
        });
    });
});