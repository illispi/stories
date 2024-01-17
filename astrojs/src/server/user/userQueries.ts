import { userProcedure } from "../../utils";

export const getPersonal = userProcedure.query(async ({ ctx }) => {
  const unSafe = await ctx.db
    .selectFrom("Personal_questions")
    .selectAll()
    .where("user", "=", ctx.user.id)
    .executeTakeFirst();

  if (!unSafe) {
    return null;
  }

  const { user, created_at, id, ...safe } = unSafe;

  return safe;
});

export const getTheirs = userProcedure.query(async ({ ctx }) => {
  const unSafe = await ctx.db
    .selectFrom("Their_questions")
    .selectAll()
    .where("user", "=", ctx.user.id)
    .execute();

  if (!unSafe.length) {
    return null;
  }

  const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
    const { user, created_at, ...safeTemp } = unSafeEl;
    return safeTemp;
  });

  return safe;
});

export const getArticles = userProcedure.query(async ({ ctx }) => {
  const unSafe = await ctx.db
    .selectFrom("Articles")
    .selectAll()
    .where("user", "=", ctx.user.id)
    .execute();

  if (!unSafe.length) {
    return null;
  }

  const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
    const { user, created_at, ...safeTemp } = unSafeEl;
    return safeTemp;
  });

  return safe;
});
