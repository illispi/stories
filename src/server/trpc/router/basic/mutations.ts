import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { userProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { NullSchema } from "valibot";

export const postPersonalStats = userProcedure
  .input(personalQuestionsSchema)
  .mutation(async ({ ctx, input }) => {
    const insertion = await ctx.db
      .insertInto("Personal_questions")
      .values({ ...input, user: ctx.user.id, accepted: NullSchema })
      .executeTakeFirst();

    if (!insertion) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Insertion failed",
      });
    }

    return "Added succesfully";
  });

export const postTheirStats = userProcedure
  .input(theirQuestionsSchema)
  .mutation(async ({ ctx, input }) => {
    const insertion = await ctx.db
      .insertInto("Their_questions")
      .values({ ...input, user: ctx.user.id, accepted: NullSchema })
      .executeTakeFirst();

    if (!insertion) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Insertion failed",
      });
    }

    return "Added succesfully";
  });

export const postArticle = userProcedure
  .input(
    z.object({
      link: z
        .string()
        .max(1000, { message: "Must be 1000 or fewer characters long" })
        .min(5, { message: "Must be 5 or more characters long" })
        .trim(),
      description: z
        .string()
        .max(500, { message: "Must be 500 or fewer characters long" })
        .min(5, { message: "Must be 5 or more characters long" })
        .trim(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const insertion = await ctx.db
      .insertInto("Articles")
      .values({ ...input, user: ctx.user.id, accepted: NullSchema })
      .executeTakeFirst();
    if (!insertion) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Insertion failed",
      });
    }

    return "Added succesfully";
  });
