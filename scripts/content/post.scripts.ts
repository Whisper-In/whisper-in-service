import { connect } from "mongoose";
import postsJSON from "../../datasets/post.datasets.json" assert { type: "json" };
import { Post, PostType } from "../../src/models/content/post.model";
import { exit } from "process";
import dotenv from 'dotenv';
import { UserProfile } from "../../src/models/user/user-profile.model";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const insertPosts = async () => {
  try {
    await connect(process.env.MONGODB_CONNECTION_STRING as string);

    await Post.deleteMany({});
    await Post.insertMany(postsJSON);

    console.log(`Insert Posts successful!`);
  } catch (error) {
    console.log(error);
  } finally {
    exit(1);
  }
}

const insertSamplePosts = async () => {
  try {
    await connect(process.env.MONGODB_CONNECTION_STRING as string);

    await Post.deleteMany({});

    const sampleDescriptions = [
      "Whatever is good for your soul, do that",
      "Even the stars were jealous of the sparkle in her eyes",
      "Stress less and enjoy the best",
      "Get out there and live a little",
      "I’m not high maintenance, you’re just low effort",
      "I’m not gonna sugar coat the truth, I’m not Willy Wonka",
      "Life is better when you’re laughing",
      "Look for the magic in every moment",
      "Vodka may not be the answer but it’s worth a shot",
      "A sass a day keeps the basics away",
      "You can regret a lot of things but you’ll never regret being kind",
      "Do whatever makes you happiest",
      "“Having the dream is easy, making it come true is hard” – Serena Williams",
      "Decluttering my life like Marie Kondo",
      "If I were rich, I’d pull a Netflix and spend $100 million on my Friends",
      "In 2023, I want to be as Insta famous as an egg and as ageless as Paul Rudd",
      "Can’t hear, can’t speak, can’t see.",
      "“Be heroes of your own stories” – Constance Wu",
      "“Hella fine and it works every time” – Ariana Grande",
      "My life is as crooked as Rami Malek’s bowtie",
      "Friends are like stars, constantly coming and going, but the ones that stay burn as bright as the sun",
      "A good friend might know your wild stories but your best friend was right there with you",
      "I would never let my best friend do anything stupid…alone",
      "bff ❤️",
      "Laughing at random things. Partying ‘til the sunrise. There’s no one else I’d want by my side. Love ya!",
      "Hold onto your best friend because you’ll never find someone like them again",
      "Back in the old days my best friend why quiet and shy. I turned her into a monster. 😜",
      "Find someone who brings out the best in you",
      "A best friend will love you when you’re too sad to love yourself",
    ]

    const samplePosts: {
      postURL: string,
      thumbnailURL?: string,
      postType: string,
      description?: string,
      creator: string,
      creatorModel: string
    }[] = [];

    const hasDecription = () => {
      return Math.random() >= 0.2
    }

    const descriptionIndex = (hasDecription:boolean) => {
      return hasDecription ? Math.round(Math.random() * (sampleDescriptions.length - 1)) : -1;
    }

    //Aiko
    const aikoProfile = await UserProfile.findOne({userName: "aiko"});
    for(let i = 1; i <= 19; i++) {
      const _hasDescription = hasDecription();
      const _descriptionIndex = descriptionIndex(_hasDescription);

      samplePosts.push({
        postURL: `https://storage.googleapis.com/whisperin-posts/Aiko/Aiko%20(${i}).png`,
        postType: PostType[PostType.PHOTO],
        creator: aikoProfile?.id,
        creatorModel: UserProfile.modelName,
        description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
      });
    }

    for(let i = 1; i <= 4; i++) {
      const _hasDescription = hasDecription();
      const _descriptionIndex = descriptionIndex(_hasDescription);
      samplePosts.push({
        postURL: `https://storage.googleapis.com/whisperin-posts/Aiko/Aiko%20(${i}).mp4`,
        thumbnailURL: `https://storage.googleapis.com/whisperin-posts/Aiko/Aiko%20(${i})-Thumbnail.png`,
        postType: PostType[PostType.VIDEO],
        creator: aikoProfile?.id,
        creatorModel: UserProfile.modelName,
        description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
      });
    }

    //Aiu
    const aiuProfile = await UserProfile.findOne({userName: "aiu"});
    for(let i = 1; i <= 18; i++) {
      const _hasDescription = hasDecription();
      const _descriptionIndex = descriptionIndex(_hasDescription);
      samplePosts.push({
        postURL: `https://storage.googleapis.com/whisperin-posts/Aiu/Aiu%20(${i}).png`,
        postType: PostType[PostType.PHOTO],
        creator: aiuProfile?.id,
        creatorModel: UserProfile.modelName,
        description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
      });
    }

    for(let i = 1; i <= 1; i++) {
      const _hasDescription = hasDecription();
      const _descriptionIndex = descriptionIndex(_hasDescription);
      samplePosts.push({
        postURL: `https://storage.googleapis.com/whisperin-posts/Aiu/Aiu%20(${i}).mp4`,
        thumbnailURL: `https://storage.googleapis.com/whisperin-posts/Aiu/Aiu%20(${i})-Thumbnail.png`,
        postType: PostType[PostType.VIDEO],
        creator: aiuProfile?.id,
        creatorModel: UserProfile.modelName,
        description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
      });
    }

    //Eva
    const evaProfile = await UserProfile.findOne({userName: "eva"});
    for(let i = 1; i <= 19; i++) {
      const _hasDescription = hasDecription();
       const _descriptionIndex = descriptionIndex(_hasDescription);
       samplePosts.push({
         postURL: `https://storage.googleapis.com/whisperin-posts/Eva/Eva%20(${i}).png`,
         postType: PostType[PostType.PHOTO],
         creator: evaProfile?.id,
         creatorModel: UserProfile.modelName,
         description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
       });
    }

    for(let i = 1; i <= 5; i++) {
      const _hasDescription = hasDecription();
       const _descriptionIndex = descriptionIndex(_hasDescription);
       samplePosts.push({
         postURL: `https://storage.googleapis.com/whisperin-posts/Eva/Eva%20(${i}).mp4`,
         thumbnailURL: `https://storage.googleapis.com/whisperin-posts/Eva/Eva%20(${i})-Thumbnail.png`,
         postType: PostType[PostType.VIDEO],
         creator: evaProfile?.id,
         creatorModel: UserProfile.modelName,
         description: _hasDescription ? sampleDescriptions[_descriptionIndex] : undefined
       });
    }

    await Post.insertMany(samplePosts);

    console.log(`Insert Sample Posts successful!`);
  } catch (error) {
    console.log(error);
  } finally {
    exit(1);
  }
}

insertSamplePosts()

//export default insertPosts();
