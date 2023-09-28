import { Options, SwaggerDefinition } from "swagger-jsdoc";
import { httpsPort, port } from "./app.config.js";

export const swaggerOptions: Options = {
  swaggerDefinition: {    
    info: {
      title: "Whisper Service",
      version: "0.0.1",
      description: "Whisper Service for Whisper App.",
    },
    host: `localhost:${port}`,
    servers: [
      {
        url: `https://localhost:${port}`,
      },
      {
        url: `https://localhost:${httpsPort}`,
      },
    ],
    schemes: ["http", "https"]
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  },
  apis: ["./src/routes/**/*.ts"],
};
