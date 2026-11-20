/**
 * Poll progress lives in localStorage under these keys (answers, current page, skip
 * bookkeeping, unit choice). A draft saved to the account is a copy of exactly these.
 */
export type PollLs = "personalQuestions" | "theirQuestions";

export const isDraftKey = (poll: PollLs, key: string) =>
	key === poll ||
	key === `page_${poll}` ||
	key === `junctions_${poll}` ||
	(key.startsWith("to_") && key.endsWith(`_${poll}`) && /^to_[a-z_]+$/.test(key.slice(0, -poll.length - 1))) ||
	(poll === "personalQuestions" && key === "system");

/** Max size of one saved draft (characters of JSON) */
export const MAX_DRAFT_SIZE = 100_000;
