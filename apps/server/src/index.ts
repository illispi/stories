import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import fastifycors from "@fastify/cors";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "./db/dbTypes";
import * as dotenv from "dotenv";

dotenv.config();

const server = fastify({
  maxParamLength: 5000,
  logger: {
    prettyPrint: true,
  },
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

server.register(fastifycors, {
  origin: [`http://127.0.0.1:3000`],
  credentials: true,
});

// You'd create one of these when you start your app.
export const db = new Kysely<Database>({
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
    server.log.error(err);
    process.exit(1);
  }
})();
