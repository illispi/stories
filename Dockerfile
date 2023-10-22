FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app/project

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]