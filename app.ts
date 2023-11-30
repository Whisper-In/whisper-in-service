import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectMongoDB } from "./src/database/mongodb.js";
import { frontendOrigin, httpsPort, port } from "./src/config/app.config.js";
import chatGPTRouter from "./src/routes/chatgpt/chatgpt.routes.js";
import chatRouter from "./src/routes/chat/chat.routes.js";
import cors from "cors";
import swaggerOutput from "./swagger_output.json" assert {type: "json"};
import googleRouter from "./src/routes/auth/google.routes.js";
import appleRouter from "./src/routes/auth/apple.routes.js";
import profileRouter from "./src/routes/profile/profile.routes.js";
import paymentRouter from "./src/routes/payment/payment.routes.js";
import userRouter from "./src/routes/user/user.routes.js";
import elevenLabsRouter from "./src/routes/elevenlabs/elevenlabs.routes.js";
import reportRouter from "./src/routes/profile/report.routes.js";
import postRouter from "./src/routes/content/post.routes.js";
import configRouter from "./src/routes/business/config.routes.js";
import { initPassport } from "./src/services/passport/initPassport.js";
import { paymentWebhook } from "./src/controllers/payment/payment.controller.js";
import https from "https";
import fs from "fs";
import path from "path";

const key = fs.readFileSync(path.join(process.cwd(), "resources", "ssl certs", "key.pem"))
const cert = fs.readFileSync(path.join(process.cwd(), "resources", "ssl certs", "cert.pem"))

const app = express();

initPassport(app);

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

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
app.use(express.urlencoded({ extended: true }));

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
  "/auth/apple",
  appleRouter
  //#swagger.tags = ['Apple']
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
  "/profile/report",
  reportRouter
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

app.use(
  "/content/posts",
  postRouter
  /* 
  #swagger.tags = ['Content']
  #swagger.security = [{"bearerAuth": []}] 
  */
)

app.use(
  "/configuration",
  configRouter
  /* 
  #swagger.tags = ['Configs']
  */
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const start = async () => {
  try {
    await connectMongoDB();

    app.listen(port, () => {
      console.log(`Whisper In Service listening on port ${port}`);
    });

    if (process.env.NODE_ENV == 'development') {
      //Create https server for testing in development
      const server = https.createServer({ key, cert }, app);
      server.listen(httpsPort, () => {
        console.log(`Whisper In Service listening on port ${httpsPort} with HTTPS`);
      });
    }

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

export default app;
