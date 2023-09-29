# Build dependencies
FROM node:17-alpine as dependencies

WORKDIR /usr/src/app
COPY package.json .
RUN npm i
COPY . . 

RUN apk add --no-cache ffmpeg

# Build production image
FROM dependencies as builder
RUN npm run build
EXPOSE ${PORT}
CMD npm run start