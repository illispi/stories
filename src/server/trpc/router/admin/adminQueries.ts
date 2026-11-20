import { z } from "zod";
import { sql } from "kysely";
import { questions as personalQuestions } from "~/data/personalQuestionsArr";
import { questions as theirQuestions } from "~/data/theirQuestionsArr";
import { adminProcedure } from "../../utils";

export const listSubmissions = adminProcedure
  .input(
    z.object({
      page: z.number().int().min(0),
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
      accepted: z.boolean().nullable(),
    })
  )
  .query(async ({ ctx, input }) => {
    //TODO update selects when you update database

    const personalQuery = ctx.db
      .selectFrom("Personal_questions")
      .select([
        "id",
        version,
        "describe_hospital",
        "what_kind_of_care_after",
        "personality_before",
        "personality_after",
        "other_help",
        "how_it_altered_life",
        "responded_to_telling",
        "life_satisfaction_description",
        "what_others_should_know",
        "not_have_schizophrenia_description",
      ]);

    const theirQuery = ctx.db
      .selectFrom("Their_questions")
      .select([
        "id",
        version,
        "personality_before",
        "personality_after",
        "how_it_altered_life",
        "what_others_should_know",
      ]);

    //TODO Use try and catch here and then return error with serverError

    // Filter each builder on its own: a union of the two builder types isn't callable.
    const poll =
      input.pOrT === "Personal_questions"
        ? await personalQuery
            .where("accepted", "is", input.accepted)
            .orderBy("id", "desc")
            .offset(input.page * 25)
            .limit(25)
            .execute()
        : await theirQuery
            .where("accepted", "is", input.accepted)
            .orderBy("id", "desc")
            .offset(input.page * 25)
            .limit(25)
            .execute();

    //BUG this might return undefined, should be returnin null in that case



    const { count } = (await ctx.db
      .selectFrom(input.pOrT)
      .select(ctx.db.fn.countAll().as("count"))
      .where("accepted", "is", input.accepted)
      .executeTakeFirst()) ?? { count: 0 };

    const total = Number(count);

    return { poll, total };
  });

export const listArticles = adminProcedure
  .input(
    z.object({
      page: z.number().int().min(0),
      accepted: z.boolean().nullable(),
    })
  )
  .query(async ({ ctx, input }) => {
    const articles = await ctx.db
      .selectFrom("Articles")
      .select((eb) => [
        "link",
        "description",
        "id",
        version,
        // total number of matching rows, repeated on every row (window function)
        eb.fn.countAll<number>().over().as("count"),
      ])
      // null = waiting for review, true = published
      .where("accepted", input.accepted === null ? "is" : "=", input.accepted)
      .orderBy("id", "desc")
      .limit(25)
      .offset(input.page * 25)
      .execute();

    return articles;
  });

/** Sent back with Accept, so an entry edited after the list loaded isn't accepted unread. */
const version = sql<string | null>`extract(epoch from updated_at)::text`.as("version");

/** Text columns people write themselves, per table, from the question lists. */
const writtenColumns = {
  Personal_questions: personalQuestions.filter((q) => q.questionType === "text").map((q) => q.questionDB as string),
  Their_questions: theirQuestions.filter((q) => q.questionType === "text").map((q) => q.questionDB as string),
  Articles: ["description", "link"],
} as const;
type SearchTable = keyof typeof writtenColumns;

const sourceName: Record<SearchTable, string> = {
  Personal_questions: "Personal poll",
  Their_questions: "Other poll",
  Articles: "Article",
};

/** ~160 characters around the first match, so the admin can compare with the user's snippet. */
const excerpt = (text: string, query: string) => {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  const start = Math.max(0, at - 70);
  const end = Math.min(text.length, at + query.length + 70);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
};

/**
 * Find the account behind a text a user quotes (e.g. someone who lost Discord access and
 * wants their data removed). Searches every written text answer and article, real data only,
 * and groups the matches per account, with how much data each account has.
 */
export const searchUsersByText = adminProcedure
  .input(z.object({ query: z.string().trim().min(4).max(200) }))
  .query(async ({ ctx, input }) => {
    // ILIKE with %, _ and \ escaped, so the snippet is matched literally
    const pattern = `%${input.query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const { ref } = ctx.db.dynamic;

    type Match = { source: string; column: string; excerpt: string; submittedAt: Date; accepted: boolean | null };
    const byUser = new Map<string, Match[]>();

    for (const table of Object.keys(writtenColumns) as SearchTable[]) {
      const columns = [...writtenColumns[table]];
      const rows = (await ctx.db
        .selectFrom(table)
        .select([...columns.map((c) => ref(c)), "user", "created_at", "accepted"])
        .where((eb) => eb.or(columns.map((c) => eb(ref(c), "ilike", pattern))))
        .limit(50)
        .execute()) as Record<string, unknown>[];

      for (const row of rows) {
        const column = columns.find((c) =>
          String(row[c] ?? "").toLowerCase().includes(input.query.toLowerCase()),
        );
        if (!column) continue;
        const user = row.user as string;
        const list = byUser.get(user) ?? [];
        list.push({
          source: sourceName[table],
          column,
          excerpt: excerpt(String(row[column]), input.query),
          submittedAt: row.created_at as Date,
          accepted: row.accepted as boolean | null,
        });
        byUser.set(user, list);
      }
    }

    const userIds = [...byUser.keys()];
    if (!userIds.length) return [];

    const users = await ctx.db
      .selectFrom("auth_user")
      .select((eb) => [
        "auth_user.id",
        "auth_user.created_at",
        "auth_user.role",
        eb.selectFrom("Personal_questions").select(eb.fn.countAll<number>().as("n")).whereRef("Personal_questions.user", "=", "auth_user.id").as("personal"),
        eb.selectFrom("Their_questions").select(eb.fn.countAll<number>().as("n")).whereRef("Their_questions.user", "=", "auth_user.id").as("their"),
        eb.selectFrom("Articles").select(eb.fn.countAll<number>().as("n")).whereRef("Articles.user", "=", "auth_user.id").as("articles"),
      ])
      .where("auth_user.id", "in", userIds)
      .execute();

    return users.map((u) => ({
      id: u.id,
      joined: u.created_at,
      isAdmin: u.role === "admin",
      counts: { personal: Number(u.personal ?? 0), their: Number(u.their ?? 0), articles: Number(u.articles ?? 0) },
      matches: byUser.get(u.id) ?? [],
    }));
  });

/** Submissions waiting for review (real data), for the admin bell in the navbar. */
export const pendingCounts = adminProcedure.query(async ({ ctx }) => {
  const count = async (table: "Personal_questions" | "Their_questions" | "Articles") =>
    Number(
      (
        await ctx.db
          .selectFrom(table)
          .select((eb) => eb.fn.countAll<number>().as("n"))
          .where("accepted", "is", null)
          .executeTakeFirst()
      )?.n ?? 0,
    );

  const [personal, their, articles] = await Promise.all([
    count("Personal_questions"),
    count("Their_questions"),
    count("Articles"),
  ]);
  return { personal, their, articles, total: personal + their + articles };
});
