import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "./db/dbTypes";

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

export const test = async () => {
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

  const allData = {
    arrayOfData: filterSensitve,
    onsetByGender: { ...ageOfOnsetByGender },
    lengthByGender: { ...lengthByGender },
  };

  return allData;
};
