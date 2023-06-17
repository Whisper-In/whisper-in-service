import { connect } from "mongoose";
import { UserProfile } from "../../src/models/user/user-profile.model.js";
import { AIProfile } from "../../src/models/ai/ai-profile.model.js";
import { Chat } from "../../src/models/chat/chat.model.js";
import {
  ChatMessage,
  IChatMessage,
} from "../../src/models/chat/chat-message.model.js";
import { faker } from "@faker-js/faker";
import { exit } from "process";


const insertTestUserProfile = async () => {
  try {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const newUserProfile = new UserProfile({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({firstName, lastName}),
      avatar: faker.internet.avatar()
    });

    await newUserProfile.save();

    console.log("Insert test user profile successful!");
  } catch (error) {
    console.log(`Failed to insert test user profile. Error: ${error}`);
  }
};

const insertTestChat = async () => {
  try {
    const profileResults = await Promise.all([
      UserProfile.findOne(),
      AIProfile.findOne(),
    ]);

    const profile1 = profileResults[0];
    const profile2 = profileResults[1];

    const newChat = new Chat({
      profiles: [
        {
          profile: profile1?._id,
          profileModel: UserProfile.modelName,
        },
        {
          profile: profile2?._id,
          profileModel: AIProfile.modelName,
        },
      ],
    });

    await newChat.save();

    console.log("Insert test chat successful!");
  } catch (error) {
    console.log(`Failed to insert test chat data. Error: ${error}`);
  }
};

const insertTestChatMessages = async () => {
  try {
    const chat = await Chat.findOne();

    const randomMessageCount = Math.random() * 4 + 1;

    const newChatMessage: IChatMessage[] = [];
    let sender = chat!.profiles[0];

    for (var i = 0; i < randomMessageCount; i++) {
      newChatMessage.push({
        chat: chat!._id,
        message: faker.lorem.sentences({ min: 1, max: 3 }),
        sender: sender.profile._id,
        senderModel: sender.profileModel,
      });

      //To alternate senderId
      sender =
        sender == chat!.profiles[0] ? chat!.profiles[1] : chat!.profiles[0];
    }

    await ChatMessage.insertMany(newChatMessage);

    console.log("Insert test chat messages successful!");
  } catch (error) {
    console.log(`Failed to insert test chat messages. Error: ${error}`);
  }
};

const insertAllTestData = async () => {
  try {
    await connect(process.env.MONGODB_CONNECTION_STRING as string);

    await insertTestUserProfile();
    await insertTestChat();
    //await insertTestChatMessages();
  } catch (error) {
  } finally {
    exit(1);
  }
};

export default insertAllTestData();
