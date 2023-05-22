import { Options } from "swagger-jsdoc";
import { port } from "./app.config.js";

export const swaggerOptions: Options = {
    swaggerDefinition: {
      openapi: "3.0.3",
      info: {
        title: "Whisper Service",
        version: "0.0.1",
        description: "Whisper Service for Whisper App.",
      },
      servers: [
        {
          url: `http://localhost:${port}`,
        },
      ],
    },
    apis: ["./src/routes/**/*.ts"],
  };
  