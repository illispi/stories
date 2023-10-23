FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app

RUN npm install pnpm -g

ENV NODE_ENV=production

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY /app/node_modules ./node_modules

RUN pnpm build

COPY /dist .

EXPOSE 3000

CMD ["node", "server.js"]