import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { DB } from "./db/dbTypes";
import "dotenv/config";
import { PersonalQuestions } from "zod-types";
import { createCookieSessionStorage, json, redirect } from "solid-start";
import { questions } from "../data/personalQuestionsArr";

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
    secrets: [process.env.SESSSION_SECRET],
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
      .values({ id: sql`DEFAULT` })
      .returning("id")
      .executeTakeFirstOrThrow();

    if (user.id) {
      session.set("userId", user.id);
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

export const personalStatsGet = async () => {
  const allPersonalStats = await db
    .selectFrom("personal_questions")
    .selectAll()
    .execute();

  const responsesTotal = allPersonalStats.length;

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

  const filterSensitive = allPersonalStats.map(
    (e: typeof allPersonalStats[0]) => {
      const { user_id, created_at, id, ...filtered } = e;
      return filtered;
    }
  );

  const automatic = questions.map((e) => {
    if (e.questionType === "yesOrNo") {
      const yesOrNo = filterSensitive.map((i) => i[e.questionDB]);
      return {
        [e.questionDB]: {
          yes: yesOrNo.filter((i) => i === true).length,
          no: yesOrNo.filter((i) => i === false).length,
        },
      };
    } else if (e.questionType === "integer") {
      if (e.questionDB === "weight_amount") {
        const resBrackets = {
          b05: 0,
          b0610: 0,
          b1120: 0,
          b2130: 0,
          b3140: 0,
          b4150: 0,
          b5180: 0,
          b81200: 0,
        };
        filterSensitive
          .map((d) => d.weight_amount)
          .filter((f) => f !== null)
          .forEach((i) => {
            if (i <= 5) {
              resBrackets.b05++;
            } else if (i >= 6 && i <= 10) {
              resBrackets.b0610++;
            } else if (i >= 11 && i <= 20) {
              resBrackets.b1120++;
            } else if (i >= 21 && i <= 30) {
              resBrackets.b2130++;
            } else if (i >= 31 && i <= 40) {
              resBrackets.b3140++;
            } else if (i >= 41 && i <= 50) {
              resBrackets.b4150++;
            } else if (i >= 51 && i <= 80) {
              resBrackets.b5180++;
            } else if (i >= 81 && i <= 200) {
              resBrackets.b81200++;
            }
          });
        return { weight_amount: resBrackets };
      } else if (e.questionDB === "age_of_onset") {
        const average = (obj: typeof maleAge) => {
          return obj.reduce((a, b) => a + b.age_of_onset, 0) / obj.length;
        };
        const median = (obj: typeof maleAge) => {
          const arr = obj.map((i) => i.age_of_onset);
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

        return ageOfOnsetByGender;
      } else if (e.questionDB === "current_age") {
        const resBrackets = {
          b09: 0,
          b1015: 0,
          b1620: 0,
          b2125: 0,
          b2630: 0,
          b3135: 0,
          b3680: 0,
        };
        filterSensitive.forEach((i) => {
          if (i.current_age <= 10) {
            resBrackets.b09++;
          } else if (i.current_age >= 10 && i.current_age <= 15) {
            resBrackets.b1015++;
          } else if (i.current_age >= 16 && i.current_age <= 20) {
            resBrackets.b1620++;
          } else if (i.current_age >= 21 && i.current_age <= 25) {
            resBrackets.b2125++;
          } else if (i.current_age >= 26 && i.current_age <= 30) {
            resBrackets.b2630++;
          } else if (i.current_age >= 31 && i.current_age <= 35) {
            resBrackets.b3135++;
          } else if (i.current_age >= 36 && i.current_age <= 80) {
            resBrackets.b3680++;
          }
        });

        return { current_age: resBrackets };
      }
    } else if (e.questionType === "selection") {
      const selectionAmounts = e.selections?.map((i) => {
        return {
          [i]: filterSensitive.filter((d) => d[i] === i).length,
        };
      });

      return { [e.questionDB]: selectionAmounts };
    } else if (e.questionType === "text") {
      return {
        [e.questionDB]: filterSensitive
          .map((i) => i[e.questionDB])
          .filter((f) => f !== null)
          .slice(0, 8),
      };
    } else if (e.questionType === "multiSelect") {
      const value = e.multiSelect?.map((i) => {
        return {
          [i[1]]: filterSensitive.map((d) => d[i[0]]).filter((f) => f !== null)
            .length,
        };
      });

      return { [e.multiSelect[0][0]]: value };
    }
  });

  //BUG below code soesnt work currently, and its not even used in frontend

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

  //BUG above seems to return too little

  return { total: responsesTotal, ...automatic };
};

//BUG in solid start? server doesnt recompile even though it says it does
