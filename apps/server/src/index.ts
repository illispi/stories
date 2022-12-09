import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import fastifycors from "@fastify/cors";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./db/dbTypes";
import * as dotenv from "dotenv";
import fastifyRedis from "@fastify/redis";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import { __prod__ } from "./constants";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import fs from "fs";
import os from "os";
import helmet from "@fastify/helmet";
//TODO might need to import DB rather from zod-types

dotenv.config();

const nets = os.networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
  for (const net of nets[name]!) {
    if (net.family === "IPv4" && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

const key = Object.keys(results);
const ip = results[key[0]][0];

// console.log("available at localnetwork ", `http://${ip}`);

fs.writeFile("../client/.env.local", `IP_DEV=${ip}`, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(".env.local was saved!");
});

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

//NOTE httponly is on by default, https need secure: true
server.register(helmet, { global: true });

server.register(fastifyCookie, { secret: process.env.COOKIE_SECRET });

const RedisStore = connectRedis(fastifySession as any);

const client = new Redis({
  host: "localhost",
  port: parseInt(process.env.REDIS_PORT as string),
});

server.register(fastifyRedis, { client });

server.register(fastifySession, {
  store: new RedisStore({
    client: client as any,
  }) as any,
  saveUninitialized: false,
  cookieName: "sessionUuid",
  secret: process.env.REDIS_SECRET,
  cookie: {
    sameSite: "lax",
    httpOnly: true,
    secure: __prod__,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days)
  },
} as any);

server.register(fastifycors, {
  origin: [
    `http://127.0.0.1:3000`,
    "http://localhost:3000",
    `http://${ip}:3000`,
  ],
  credentials: true,
  // exposedHeaders: ["set-cookie"],
});

server.decorate(
  "db",
  new Kysely<DB>({
    log: ["error", "query"],
    dialect: new PostgresDialect({
      pool: new Pool({
        host: "127.0.0.1",
        database: "stories_dev",
        password: process.env.PSQL_PASSWORD,
        user: process.env.PSQL_USERNAME,
        port: 5432,
      }),
    }),
  })
);

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

export type Db = Kysely<DB>;

declare module "fastify" {
  interface FastifyInstance {
    db: Kysely<DB>;
  }
}

//NOTE is this the smart place to do it, does it only execute once?

(async () => {
  try {
    await server.listen({ port: 4000, host: "0.0.0.0" });
  } catch (err) {
    server.db.destroy(); //NOTE this destroys connction to db
    //TODO might need to close on succesful exit SIGINIT
    server.log.error(err);
    process.exit(1);
  }
})();
