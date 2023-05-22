import swaggerAutogen from "swagger-autogen";

const outputFile = './swagger_output.json';
const routes = ['./app.ts'];

swaggerAutogen(outputFile, routes);
