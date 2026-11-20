import { z } from "zod";
import { toWebLink, WEB_LINK_MESSAGE } from "~/utils/articleLink";

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
};
