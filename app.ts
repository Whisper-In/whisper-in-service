import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectMongoDB } from "./src/database/mongodb.js";
import { port } from "./src/config/app.config.js";
import chatGPTRouter from "./src/routes/chatgpt/chatgpt.routes.js";
import chatRouter from "./src/routes/chat/chat.routes.js";
import cors from "cors";
import swaggerOutput from "./swagger_output.json" assert { type: "json" };
import googleRouter from "./src/routes/auth/google.routes.js";
import profileRouter from "./src/routes/profile/profile.routes.js";
import paymentRouter from "./src/routes/payment/payment.routes.js";
import userRouter from "./src/routes/user/user.routes.js";
import elevenLabsRouter from "./src/routes/elevenlabs/elevenlabs.routes.js";
import { initPassport } from "./src/services/passport/initPassport.js";
import { paymentWebhook } from "./src/controllers/payment/payment.controller.js";

const app = express();

initPassport(app);

app.use(cors());

app.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook
  /* 
  #swagger.tags = ['Payment']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(express.json());

app.use(
  "/chats",
  chatRouter
  /* 
  #swagger.tags = ['Chats']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(
  "/chat-gpt",
  chatGPTRouter
  /* 
  #swagger.tags = ['ChatGPT']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(
  "/eleven-labs",
  elevenLabsRouter
  /* 
  #swagger.tags = ['Eleven Labs']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(
  "/auth/google",
  googleRouter
  //#swagger.tags = ['Google']
);

app.use(
  "/profile",
  profileRouter
  /* 
  #swagger.tags = ['Profile']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(
  "/payment",
  paymentRouter
  /* 
  #swagger.tags = ['Payment']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use(
  "/user",
  userRouter
  /* 
  #swagger.tags = ['User']
  #swagger.security = [{"bearerAuth": []}] 
  */
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const start = async () => {
  try {
    await connectMongoDB();

    app.listen(port, () => {
      console.log(`Whisper In Service listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

export default app;
