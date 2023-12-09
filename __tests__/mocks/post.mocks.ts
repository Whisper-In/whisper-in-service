import { faker } from "@faker-js/faker";
import { IPost, PostType } from "../../src/models/content/post.model";
import { ObjectId } from "mongoose";
import path from "path";

export const createMockPosts = (creators: ObjectId[]) => {
    const posts: IPost[] = []

    creators.forEach((creator) => {
        Array.from(Array(6)).forEach(() => {
            posts.push({
                postURL: faker.internet.url(),
                thumbnailURL: faker.internet.url(),
                postType: PostType[PostType.PHOTO],
                description: faker.lorem.sentence({ min: 0, max: 20 }),
                creator
            });

            posts.push({
                postURL: faker.internet.url(),
                thumbnailURL: faker.internet.url(),
                postType: PostType[PostType.VIDEO],
                description: faker.lorem.sentence({ min: 0, max: 20 }),
                creator
            })
        });
    });

    return posts;
}

export const mockPhotoPath = path.resolve(__dirname, "./photo.jpg");
export const mockVideoPath = path.resolve(__dirname, "./video.mp4");