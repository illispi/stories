FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install

RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]