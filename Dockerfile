FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

RUN npm install --force

COPY . ./app

EXPOSE 3002

CMD ["npm", "run", "start"]