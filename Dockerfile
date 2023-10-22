FROM --platform=linux/arm64 node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --force

RUN npm ci --omit=dev --force

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]