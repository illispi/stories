FROM node:20

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install

RUN npm ci --omit=dev

RUN npm build