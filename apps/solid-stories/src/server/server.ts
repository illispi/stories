import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { DB } from "./db/dbTypes";
import "dotenv/config";
import { PersonalQuestions } from "zod-types";
import { createCookieSessionStorage, json, redirect } from "solid-start";

const db = new Kysely<DB>({
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

const storage = createCookieSessionStorage({
  cookie: {
    name: "session",
    secure: import.meta.env.PROD,
    secrets: ["egesgsgeskpsgoåkogpeskopgesopesgkokpsgeegsokpesgpko"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

const getSessionFromCookie = async (request: Request) => {
  const cookie = request.headers.get("Cookie") ?? "";
  const session = await storage.getSession(cookie);
  return { userId: session.get("userId"), session: session };
};

export const createOrGetUser = async (request: Request) => {
  const { session, userId } = await getSessionFromCookie(request);
  if (!userId) {
    const user = await db
      .insertInto("user")
      .values({ user_id: sql`DEFAULT` })
      .returning("user_id")
      .executeTakeFirstOrThrow();

    if (user.user_id) {
      session.set("userId", user.user_id);
      return json("Cookie set", {
        headers: {
          "Set-Cookie": await storage.commitSession(session),
        },
      });
    } else {
      return "error";
    }
  }
  return "Already has a cookie";
};

export const personalStatsPost = async (data, request: Request) => {
  const { userId } = await getSessionFromCookie(request);

  if (!userId) {
    return "no userId in session found";
  }

  const user = await db
    .selectFrom("user")
    .select("user_id")
    .where("user_id", "=", userId)
    .executeTakeFirstOrThrow();

  if (user?.user_id) {
    const insertion = await db
      .insertInto("personal_questions")
      .values({ ...data, user_id: user.user_id })
      .execute();

    if (insertion) {
      return "Added succesfully";
    }
  }
  return "failed to insert";
};

export const personalStatsGet = async () => {
  const allPersonalStats = await db
    .selectFrom("personal_questions")
    .selectAll()
    .execute();

  const filterSensitve = allPersonalStats.map(
    (e: typeof allPersonalStats[0]) => {
      const { user_id, created_at, answer_personal_id, ...filtered } = e;
      return filtered;
    }
  );

  const maleAge = await db
    .selectFrom("personal_questions")
    .select(["age_of_onset"])
    .where("gender", "=", "male")
    .execute();

  const femaleAge = await db
    .selectFrom("personal_questions")
    .select(["age_of_onset"])
    .where("gender", "=", "female")
    .execute();
  const otherAge = await db
    .selectFrom("personal_questions")
    .select(["age_of_onset"])
    .where("gender", "=", "other")
    .execute();

  const average = (obj: typeof maleAge) => {
    return obj.reduce((a, b) => a + b.age_of_onset, 0) / obj.length;
  };
  const median = (obj: typeof maleAge) => {
    const arr = obj.map((e) => e.age_of_onset);
    const sorted = arr.sort((a, b) => a - b);
    return sorted[Math.floor(arr.length / 2)];
  };

  const ageOfOnsetByGender = {
    maleAverage: average(maleAge),
    femaleAverage: average(femaleAge),
    otherAverage: average(otherAge),
    maleMedian: median(maleAge),
    femaleMedian: median(femaleAge),
    otherMedian: median(otherAge),
  };

  const maleSplit = await db
    .selectFrom("personal_questions")
    .select(["length_of_psychosis"])
    .where("gender", "=", "male")
    .execute();

  const femaleSplit = await db
    .selectFrom("personal_questions")
    .select(["length_of_psychosis"])
    .where("gender", "=", "female")
    .execute();
  const otherSplit = await db
    .selectFrom("personal_questions")
    .select(["length_of_psychosis"])
    .where("gender", "=", "other")
    .execute();

  const lengthByGender = {
    ...maleSplit,
    ...femaleSplit,
    ...otherSplit,
  };

  //BUG this seems to return too little

  const allData = {
    arrayOfData: filterSensitve,
    onsetByGender: { ...ageOfOnsetByGender },
    lengthByGender: { ...lengthByGender },
  };

  return allData;
};

//BUG in solid start? server doesnt recompile even though it says it does
