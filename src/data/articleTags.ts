/** Topics an article can be tagged with (1-3 per article). Keys are stored in Articles.tags. */
export const ARTICLE_TAGS = [
	["personal-story", "Personal story"],
	["recovery", "Recovery"],
	["medication", "Medication"],
	["treatment", "Treatment & care"],
	["research", "Research"],
	["family", "Family & relatives"],
	["work-school", "Work & school"],
	["interview", "Interview"],
] as const;

export type ArticleTag = (typeof ARTICLE_TAGS)[number][0];

export const ARTICLE_TAG_KEYS = ARTICLE_TAGS.map(([key]) => key) as [ArticleTag, ...ArticleTag[]];

export const MAX_ARTICLE_TAGS = 3;

export const isArticleTag = (value: unknown): value is ArticleTag =>
	typeof value === "string" && (ARTICLE_TAG_KEYS as readonly string[]).includes(value);

export const tagLabel = (key: string) => ARTICLE_TAGS.find(([k]) => k === key)?.[1] ?? key;
