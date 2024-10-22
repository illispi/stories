FROM node:22-alpine AS base


WORKDIR /app

COPY . .

RUN npm install --force

RUN npm run build

COPY . .

RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["run"]

# CMD ["node", "server.js"]