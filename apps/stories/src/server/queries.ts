import { query$ } from "@prpc/solid";
import { z } from "zod";
import { db } from "./server";
import { questions } from "~/data/personalQuestionsArr";
import type { MainReturn } from "~/types/types";
import type { PersonalQuestions } from "~/types/zodFromTypes";
import { personalQuestionsSchema } from "./questionsSchemas";
//TODO remember to only update this every once in a while in production

export const allStats = query$({
  queryFn: async ({ payload }) => {
    let stats;

    switch (payload.value) {
      case "all":
        stats = await db.selectFrom("Personal_questions").selectAll().execute();
        break;
      case "female":
        stats = await db
          .selectFrom("Personal_questions")
          .selectAll()
          .where("gender", "=", "female")
          .execute();
        break;
      case "other":
        stats = await db
          .selectFrom("Personal_questions")
          .selectAll()
          .where("gender", "=", "other")
          .execute();
        break;
      case "male":
        stats = await db
          .selectFrom("Personal_questions")
          .selectAll()
          .where("gender", "=", "male")
          .execute();
        break;
      case "schizophrenia":
        stats = await db
          .selectFrom("Personal_questions")
          .selectAll()
          .where("diagnosis", "=", "schizophrenia")
          .execute();

        break;
      case "schizoaffective":
        stats = await db
          .selectFrom("Personal_questions")
          .selectAll()
          .where("diagnosis", "=", "schizoaffective")
          .execute();
        break;

      default:
        break;
    }

    const responsesTotal: number = stats.length;

    const maleAge = await db
      .selectFrom("Personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "male")
      .execute();

    const femaleAge = await db
      .selectFrom("Personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "female")
      .execute();
    const otherAge = await db
      .selectFrom("Personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "other")
      .execute();

    const filterSensitive = stats.map((e: typeof stats[0]) => {
      const { user, created_at, id, ...filtered } = e;
      return filtered;
    });

    const automatic: MainReturn = {} as any;

    questions.forEach((e) => {
      if (e.questionType === "yesOrNo") {
        const yesOrNo = filterSensitive.map((i) => i[e.questionDB]);
        automatic[e.questionDB] = {
          yes: yesOrNo.filter((i) => i === true).length,
          no: yesOrNo.filter((i) => i === false).length,
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
          automatic.weight_amount = resBrackets;
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

          automatic.ageOfOnsetByGender = ageOfOnsetByGender;
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

          automatic.current_age = resBrackets;
        }
      } else if (e.questionType === "selection") {
        const selections = {};
        e.selections?.forEach((i) => {
          selections[i] = filterSensitive.filter(
            (d) => d[e.questionDB] === i
          ).length;
        });
        automatic[e.questionDB] = selections;
      } else if (e.questionType === "text") {
        const allTexts = filterSensitive
          .map((i) => i[e.questionDB])
          .filter((f) => f !== null);

        automatic[e.questionDB] = [];

        for (
          let index = 0;
          index <= (allTexts.length <= 8 ? allTexts.length : 8);
          index++
        ) {
          const element =
            allTexts.length === 1
              ? 0
              : Math.floor(Math.random() * allTexts.length);

          automatic[e.questionDB].push(allTexts[element]);
          allTexts.splice(element, 1);
        }
      } else if (e.questionType === "multiSelect") {
        const multiSelections = {};

        e.multiSelect?.forEach((i) => {
          Object.assign(multiSelections, {
            [i[1]]: filterSensitive.filter((d) => d[i[0]] === true).length,
          });
        });

        automatic[e.questionDB] = multiSelections;
      }
    });

    //BUG below code soesnt work currently, and its not even used in frontend

    const maleSplit = await db
      .selectFrom("Personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "male")
      .execute();

    const femaleSplit = await db
      .selectFrom("Personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "female")
      .execute();
    const otherSplit = await db
      .selectFrom("Personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "other")
      .execute();

    //BUG above seems to return too little

    /*   const selections = {};
        e.selections?.forEach((i) => {
          selections[i] = filterSensitive.filter(
            (d) => d[e.questionDB] === i
          ).length;
        });
        automatic[e.questionDB] = selections; */

    const lengthPsyFunc = (split) => {
      const object = {};

      const lengthSelections = questions
        .find((q) => q.questionDB === "length_of_psychosis")
        ?.selections?.map((r) => r);
      lengthSelections?.forEach((e) => {
        object[e] = split.filter((i) => i.length_of_psychosis === e).length;
      });

      return object;
    };

    automatic.lengthByGender = {
      maleSplit: lengthPsyFunc(maleSplit),
      femaleSplit: lengthPsyFunc(femaleSplit),
      otherSplit: lengthPsyFunc(otherSplit),
    };

    automatic.total = responsesTotal;

    return automatic;
  },
  key: "allStats",
  schema: z.object({
    value: z.enum([
      "all",
      "schizophrenia",
      "schizoaffective",
      "female",
      "other",
      "male",
    ]),
  }), // this will be used as the query key (along with the input)
}); // this will be used as the input type and input validation

export const textPagination = query$({
  queryFn: async ({ payload }) => {
    let stats = db
      .selectFrom("Personal_questions")
      .select([payload.stat as keyof PersonalQuestions, "gender", "diagnosis"])
      .where(payload.stat as keyof PersonalQuestions, "!=", "null");

    if (payload.gender) {
      stats = stats.where("gender", "=", payload.gender.toLowerCase());
    }

    if (payload.diagnosis) {
      stats = stats.where("diagnosis", "=", payload.diagnosis.toLowerCase());
    }

    const statsFinal = await stats
      .offset(payload.page * 50)
      .limit(50)
      .execute();

    const { count } = db.fn;

    const length = await db
      .selectFrom("Personal_questions")
      .select(count(payload.stat as keyof PersonalQuestions).as("count"))
      .executeTakeFirst();

    const totalLength = Number(length?.count ?? "0");

    //NOTE remove log below

    console.log(
      personalQuestionsSchema.parse({
        hospitalized_on_first: true,
        care_after_hospital: true,
        what_kind_of_care_after: undefined,
      })
    );

    return { stats: statsFinal, total: totalLength };
  },
  key: "textPagination",
  schema: z.object({
    page: z.number(),
    stat: z.string(),
    gender: z.enum(["Female", "Other", "Male"]).nullable(),
    diagnosis: z.enum(["Schizophrenia", "Schizoaffective"]).nullable(),
  }),
});
