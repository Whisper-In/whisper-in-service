import { faker } from "@faker-js/faker";
import { IChatMessage } from "../../src/models/chat/chat-message.model";

export const createMockMessages = (count: number, chatId: any, sender: any) => {
    const messages = Array.from(Array(count)).map((): IChatMessage => ({
        chatId,
        message: faker.lorem.text(),
        sender
    }));

    return messages;
}