FROM --platform=linux/arm64 node:20-alpine

RUN npm i -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN pnpm i

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start"]