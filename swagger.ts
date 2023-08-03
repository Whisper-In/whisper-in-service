import swaggerAutogen from "swagger-autogen";
import { swaggerOptions } from "./src/config/swagger.config.js";

const outputFile = './swagger_output.json';
const routes = ['./app.ts'];
console.log(swaggerOptions)
swaggerAutogen(outputFile, routes, swaggerOptions);
