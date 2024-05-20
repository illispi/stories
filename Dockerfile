FROM oven/bun:1 AS build


WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["run"]

# CMD ["node", "server.js"]