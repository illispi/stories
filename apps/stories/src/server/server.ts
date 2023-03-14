import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { DB } from "../db/dbTypes";
import "dotenv/config";
import { createCookieSessionStorage, json } from "solid-start";
import { questions } from "../data/personalQuestionsArr";
import type { MainReturn } from "./types";

//NOTE put for instance console.log inside that and you can check if you have multiple pools

const testPools = () => {
  console.log("multipleTimes!!!!");

  return new Kysely<DB>({
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
  });
};

export const db = testPools();

export const personalStatsPost = async (data, request: Request) => {
  const { userId } = await getSessionFromCookie(request);

  if (!userId) {
    return "no userId in session found";
  }

  const user = await db
    .selectFrom("user")
    .select("id")
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  if (user?.id) {
    const insertion = await db
      .insertInto("personal_questions")
      .values({ ...data, user_id: user.id })
      .execute();

    if (insertion) {
      return "Added succesfully";
    }
  }
  return "failed to insert";
};

//BUG in solid start? server doesnt recompile even though it says it does
//BUG migrations cant be done from solid start
