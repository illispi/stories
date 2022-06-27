import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import fastifycors from "@fastify/cors";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./db/dbTypes";
import * as dotenv from "dotenv";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import { __prod__ } from "./constants";

dotenv.config();

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

//NOTE httponly is on by default, https need secure: true

server.register(fastifyCookie, { secret: process.env.COOKIE_SECRET });

const RedisStore = connectRedis(fastifySession as any);
const redisClient = new Redis(Number(process.env.REDIS_PORT));

server.register(fastifySession, {
  store: new RedisStore({
    client: redisClient as any,
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
  origin: [`http://127.0.0.1:3000`],
  credentials: true,
});

// You'd create one of these when you start your app.
export const db = new Kysely<DB>({
  // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
  dialect: new PostgresDialect({
    pool: new Pool({
      host: "127.0.0.1",
      database: "kysely_test",
      password: process.env.PSQL_PASSWORD,
      user: "postgres",
      port: 5432,
    }),
  }),
});

//NOTE is this the smart place to do it, does it only execute once?

(async () => {
  try {
    await server.listen(4000);
  } catch (err) {
    db.destroy(); //NOTE this destroys connction to db
    //NOTE might need to close on succesful exit
    server.log.error(err);
    process.exit(1);
  }
})();
