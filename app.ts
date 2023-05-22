import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { connectMongoDB } from "./src/database/mongodb.js";
import { port } from "./src/config/app.config.js";
import chatGPTRouter from "./src/routes/chatgpt/chatgpt.routes.js";
import chatRouter from "./src/routes/chat/chat.routes.js";
import cors from "cors";
import swaggerOutput from "./swagger_output.json" assert { type: "json" };

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/chats",
  chatRouter
  //#swagger.tags = ['Chats']
);

app.use(
  "/chat-gpt",
  chatGPTRouter
  //#swagger.tags = ['ChatGPT']
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const start = async () => {
  try {
    await connectMongoDB();

    app.listen(port, () => {
      console.log(`Whisper Service listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

export default app;
