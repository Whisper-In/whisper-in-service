import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { UserProfile } from "../../src/models/user/user-profile.model";
import { Post, PostType } from "../../src/models/content/post.model";
import { uploadFile } from "../../src/services/google-cloud/google-cloud.service";
import Ffmpeg from "fluent-ffmpeg";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const EMAILS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"]

const START_USER = undefined;

const createSnapshot = async (userId: string, filePath: string, fileName: string) => {
    const snapshotPath = `${userId}/${Date.now()}_thumbnail`;
    const snapshotFileName = "snapshot.jpg";

    if (!fs.existsSync(snapshotPath)) {
        fs.mkdirSync(snapshotPath, {
            recursive: true
        });
    }

    const rmSnapshot = () => {
        fs.rmSync(snapshotPath, { recursive: true, force: true });

        if (fs.existsSync(userId)) {
            fs.rmdirSync(userId);
        }
    }

    const snapshotBuffer = await new Promise<Buffer | null>((resolve, reject) => {
        Ffmpeg(filePath).takeScreenshots({
            count: 1,
            filename: snapshotFileName,
            folder: snapshotPath
        }, snapshotPath)
            .on("error", (err) => {
                console.log("ffmpeg:", err);
                rmSnapshot();

                resolve(null);
            })
            .on("end", () => {
                fs.readFile(`${snapshotPath}/${snapshotFileName}`, (err, data) => {
                    rmSnapshot();
                    resolve(data);
                });
            });
    });

    if (snapshotBuffer) {
        const thumbnailFile = await uploadFile(process.env.GOOGLE_STORAGE_POSTS_BUCKET_NAME as string, `${userId}/${fileName}_thumbnail.jpg`, snapshotBuffer);
        return thumbnailFile.publicUrl();
    }
}

const uploadPost = async (userId: string, filePath: string) => {
    const fileName = `${userId}/${Date.now()}_post.jpg`;

    const buffer = fs.readFileSync(filePath);

    if (buffer) {
        const postFile = await uploadFile(process.env.GOOGLE_STORAGE_POSTS_BUCKET_NAME as string, fileName, buffer);
        return postFile.publicUrl();
    }
}

const uploadAvatar = async (userId: string, filePath: string) => {
    const fileName = `${userId}/avatar.jpg`;
    const buffer = fs.readFileSync(filePath);

    if (buffer) {
        const postFile = await uploadFile(process.env.GOOGLE_STORAGE_PROFILE_BUCKET_NAME as string, fileName, buffer);
        return postFile.publicUrl();
    }
}

const insertDemoPosts = async () => {
    const dir = path.join(process.cwd(), "datasets", "sample-posts");
    const folders = fs.readdirSync(dir);

    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    //const conn = mongoose.connection;
    //const session = await conn.startSession();

    try {
        //session.startTransaction();
        const start = Date.now();

        if (START_USER) {
            while (folders[0] != START_USER) {
                folders.shift();
            }
        }

        for (const user of folders) {
            const userStart = Date.now();

            const userFolderDir = path.join(dir, user);
            let posts = fs.readdirSync(userFolderDir);

            posts = posts.filter(f => f != "texts");

            const textFilesDir = path.join(userFolderDir, "texts");
            const textFiles = fs.existsSync(textFilesDir) ? fs.readdirSync(textFilesDir) : [];

            let userProfile = await UserProfile.findOne({ userName: user });

            if (!userProfile) {
                const nameSplit = user.split(".");
                const nameArray = nameSplit.map((n) => `${n[0].toUpperCase()}${n.substring(1)}`);
                const name = nameArray.join(" ");

                const email = EMAILS[Math.random() * EMAILS.length - 1];

                userProfile = new UserProfile({
                    email: `${user}@${email}`,
                    name,
                    userName: user,
                });

                await userProfile.save();
            }

            const userId = userProfile.id;
            let avatar: string | undefined;

            console.log("Created user:", user, `(${new Date().toISOString()})`);

            for (const post of posts) {
                const postFileNameSplit = post.split(".");
                const postFileName = postFileNameSplit[0];
                const postExt = postFileNameSplit[1];

                const textFile = textFiles.find(t => {
                    const textFileName = t.split(".")[0];
                    return postFileName.includes(textFileName);
                });

                let text: string | undefined;

                if (textFile) {
                    const textFilePath = path.join(textFilesDir, textFile);
                    text = fs.readFileSync(textFilePath, "utf8");
                }

                const isVideo = postExt == "mp4";
                const postType = PostType[isVideo ? PostType.VIDEO : PostType.PHOTO];

                const postFilePath = path.join(userFolderDir, post);

                const postURL = await uploadPost(userId, postFilePath);

                let thumbnailURL: string | undefined;

                if (postType == PostType[PostType.VIDEO]) {
                    thumbnailURL = await createSnapshot(userId, postFilePath, post);
                } else {
                    //Create avatar
                    if (!avatar) {
                        if (Math.random() <= 0.3) {
                            avatar = await uploadAvatar(userId, postFilePath);
                            await userProfile.updateOne({ avatar });

                            console.log("==> Updated avatar with", post);
                        }
                    }
                }

                //Create post                
                if (postURL) {
                    const newPost = new Post({
                        creator: userId,
                        description: text,
                        postType: PostType[isVideo ? PostType.VIDEO : PostType.PHOTO],
                        postURL,
                        thumbnailURL
                    });

                    await newPost.save();

                    console.log("==> Created post:", post);
                } else {
                    console.log("==> Failed: ", `${user}/${post}`);
                }
            }

            console.log("Duration:", `${(Date.now() - userStart) / 1000}s`)
            console.log("Total Duration:", `${(Date.now() - start) / 1000}s`)
        }

        //await session.commitTransaction();

    } catch (error) {
        //await session.abortTransaction();

        console.log(error);

        throw error;
    }
}

insertDemoPosts();