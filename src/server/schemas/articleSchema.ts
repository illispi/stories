import { z } from "zod";
import { toWebLink, WEB_LINK_MESSAGE } from "~/utils/articleLink";
import { ARTICLE_TAG_KEYS, MAX_ARTICLE_TAGS } from "~/data/articleTags";

/** Shared by postArticle and editArticle. */
export const articleFields = {
	link: z
		.string()
		.trim()
		.min(5, { message: "Must be 5 or more characters long" })
		.max(1000, { message: "Must be 1000 or fewer characters long" })
		.refine((s) => toWebLink(s) !== null, { message: WEB_LINK_MESSAGE })
		.transform((s) => toWebLink(s) as string),
	description: z
		.string()
		.trim()
		.min(5, { message: "Must be 5 or more characters long" })
		.max(500, { message: "Must be 500 or fewer characters long" }),
	tags: z
		.array(z.enum(ARTICLE_TAG_KEYS))
		.min(1, { message: "Pick at least one topic" })
		.max(MAX_ARTICLE_TAGS, { message: `Pick at most ${MAX_ARTICLE_TAGS} topics` })
		.transform((tags) => [...new Set(tags)]),
};
