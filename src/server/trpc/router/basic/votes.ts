import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userProcedure } from "../../utils";

/** Vote an article helpful, or take the vote back. Published articles only, not your own. */
export const toggleHelpful = userProcedure
	.input(z.object({ articleId: z.number().int() }))
	.mutation(async ({ ctx, input }) => {
		const article = await ctx.db
			.selectFrom("Articles")
			.select(["id", "user"])
			.where("id", "=", input.articleId)
			.where("accepted", "=", true)
			.executeTakeFirst();
		if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
		if (article.user === ctx.user.id) {
			throw new TRPCError({ code: "FORBIDDEN", message: "You can't vote for your own article" });
		}

		const removed = await ctx.db
			.deleteFrom("article_votes")
			.where("article_id", "=", input.articleId)
			.where("user", "=", ctx.user.id)
			.executeTakeFirst();
		if (!removed.numDeletedRows) {
			await ctx.db
				.insertInto("article_votes")
				.values({ article_id: input.articleId, user: ctx.user.id })
				.onConflict((oc) => oc.doNothing())
				.execute();
		}
		return { voted: !removed.numDeletedRows };
	});
