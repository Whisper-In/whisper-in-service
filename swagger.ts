import swaggerAutogen from "swagger-autogen";
import { swaggerOptions } from "./src/config/swagger.config";

const outputFile = './swagger_output.json';
const routes = ['./app.ts'];

swaggerAutogen(outputFile, routes, swaggerOptions);
