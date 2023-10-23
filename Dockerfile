FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app

RUN npm install pnpm -g

ENV NODE_ENV=production

COPY . .

# COPY package.json ./
# COPY pnpm-lock.yaml ./

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["node", "server.js"]