import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectMongoDB } from "./src/database/mongodb.js";
import { port } from "./src/config/app.config.js";
import chatGPTRouter from "./src/routes/chatgpt/chatgpt.routes.js";
import chatRouter from "./src/routes/chat/chat.routes.js";
import cors from "cors";
import swaggerOutput from "./swagger_output.json" assert { type: "json" };
import googleRoute from "./src/routes/auth/google.routes.js";
import profileRoutes from "./src/routes/profile/profile.routes.js";
import paymentRoutes from "./src/routes/payment/payment.routes.js";
import userRoutes from "./src/routes/user/user.routes.js";
import { initPassport } from "./src/services/passport/initPassport.js";
import { paymentWebhook } from "./src/controllers/payment/payment.controller.js";

const app = express();

initPassport(app);

app.use(cors());

app.post("/payment/webhook", express.raw({ type: "application/json" }), paymentWebhook);

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

app.use(
  "/auth/google",
  googleRoute
  //#swagger.tags = ['Google']
);

app.use(
  "/profile",
  profileRoutes
  //#swagger.tags = ['Profile']
);

app.use(
  "/payment",
  paymentRoutes
  //#swagger.tags = ['Payment']
);

app.use(
  "/user",
  userRoutes
  //#swagger.tags = ['Payment']
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
