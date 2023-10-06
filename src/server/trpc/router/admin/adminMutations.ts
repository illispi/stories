import { z } from "zod";
import { adminProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { createFakeDataPersonal } from "~/utils/faker/personalQuestionsFaker";
import { createFakeDataTheir } from "~/utils/faker/theirQuestionsFaker";
import { faker } from "@faker-js/faker";

export const acceptArticle = adminProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const insertion = await ctx.db
      .updateTable("Articles")
      .set({
        accepted: true,
      })
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (!insertion) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Insertion failed",
      });
    }

    return "Added succesfully";
  });

export const declineArticle = adminProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const insertion = await ctx.db
      .updateTable("Articles")
      .set({
        accepted: false,
      })
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (!insertion) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Insertion failed",
      });
    }

    return "Added succesfully";
  });

export const acceptSubmission = adminProcedure
  .input(
    z.object({
      id: z.number(),
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updated = await ctx.db
      .updateTable(input.pOrT)
      .set({
        accepted: true,
      })
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Update failed",
      });
    }

    return "Updated succesfully";
  });

export const declineSubmission = adminProcedure
  .input(
    z.object({
      id: z.number(),
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updated = await ctx.db
      .updateTable(input.pOrT)
      .set({
        accepted: false,
      })
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Update failed",
      });
    }

    return "Updated succesfully";
  });

export const fakeForFake = adminProcedure
  .input(
    z.object({
      pOrT: z.enum(["Personal_questions_fake", "Their_questions_fake"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const fakeData =
      input.pOrT === "Personal_questions_fake"
        ? createFakeDataPersonal()
        : createFakeDataTheir();

    try {
      input.pOrT === "Personal_questions_fake"
        ? personalQuestionsSchema.parse(fakeData)
        : theirQuestionsSchema.parse(fakeData);

      const fakeInsert = await ctx.db
        .insertInto(input.pOrT)
        .values({
          ...fakeData,
        })
        .executeTakeFirst();

      if (!fakeInsert) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insertion failed",
        });
      }

      return "Insertion success";
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });

export const fakeForDev = adminProcedure
  .input(
    z.object({
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const fakeData =
      input.pOrT === "Personal_questions"
        ? createFakeDataPersonal()
        : createFakeDataTheir();

    try {
      input.pOrT === "Personal_questions"
        ? personalQuestionsSchema.parse(fakeData)
        : theirQuestionsSchema.parse(fakeData);

      const fakeInsert = await ctx.db
        .insertInto(input.pOrT)
        .values({
          ...fakeData,
          user: ctx.user.id,
          accepted: null,
        })
        .executeTakeFirst();

      if (!fakeInsert) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insertion failed",
        });
      }

      return "Insertion success";
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });

export const fakeForDevBulk = adminProcedure
  .input(
    z.object({
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      for (let index = 0; index < 20; index++) {
        const fakeData =
          input.pOrT === "Personal_questions"
            ? createFakeDataPersonal()
            : createFakeDataTheir();

        input.pOrT === "Personal_questions"
          ? personalQuestionsSchema.parse(fakeData)
          : theirQuestionsSchema.parse(fakeData);

        const fakeInsert = await ctx.db
          .insertInto(input.pOrT)
          .values({
            ...fakeData,
            user: ctx.user.id,
            accepted: true,
          })
          .executeTakeFirst();

        if (!fakeInsert) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Insertion failed",
          });
        }
      }
      return "Insertion success";
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });

export const fakeArticlesForDev = adminProcedure.mutation(async ({ ctx }) => {
  const add = await ctx.db
    .insertInto("Articles")
    .values({
      description: faker.lorem
        .paragraphs(10)
        .substring(0, Math.floor(Math.random() * 400) + 4),
      link: faker.internet.url(),
      user: ctx.session.user.userId,
    })
    .executeTakeFirst();

  if (add) {
    return "success";
  } else {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fake article",
    });
  }
});
