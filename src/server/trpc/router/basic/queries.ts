import { z } from "zod";
import { sql } from "kysely";
import { ARTICLE_TAG_KEYS } from "~/data/articleTags";
import { questions as personalQuestions } from "~/data/personalQuestionsArr";
import { questions as theirQuestions } from "~/data/theirQuestionsArr";
import type { MainReturn } from "~/types/types";
import { publicProcedure } from "../../utils";
import { countAgeBrackets } from "~/utils/ageBrackets";
import { cachedStats } from "~/server/statsCache";
import { isSensitive, PREFER_NOT_LABEL } from "~/data/sensitiveQuestions";
import { aggregateViewAllowed, allCellsSafe, matching, respondentCells, tooSmall } from "~/server/privacy";
import type { Context } from "../../context";

// Only free-text answers may be paged through textPagination. Anything else
// (e.g. the `user` column) must never be selectable by name from the client.
const textStats = new Set<string>(
	[...personalQuestions, ...theirQuestions]
		.filter((q) => q.questionType === "text")
		.map((q) => q.questionDB as string),
);
// allStats results are cached for a minute (src/server/statsCache.ts)

const allStatsInput = z.object({
	value: z.enum([
		"all",
		"schizophrenia",
		"schizoaffective",
		"female",
		"other",
		"male",
	]),
	pOrT: z.enum(["Personal_questions", "Their_questions"]),
	fake: z.enum(["real", "fake"]),
	/** Only used with a gender `value`: limit that gender to one diagnosis. */
	diagnosis: z.enum(["all", "schizophrenia", "schizoaffective"]).default("all"),
});

export const allStats = publicProcedure
	.input(allStatsInput)
	.query(({ input, ctx }) => cachedStats(JSON.stringify(input), () => computeAllStats(input, ctx)));

const computeAllStats = async (payload: z.infer<typeof allStatsInput>, ctx: Context) => {
		{
			let stats: Record<string, any>[] = [];

			const questions =
				payload.pOrT === "Personal_questions"
					? personalQuestions
					: theirQuestions;

			// A gender view can also be narrowed to one diagnosis (Compare → By Gender).
			const gender =
				payload.value === "male" || payload.value === "female" || payload.value === "other"
					? payload.value
					: null;
			const diagnosis =
				payload.value === "schizophrenia" || payload.value === "schizoaffective"
					? payload.value
					: gender && payload.diagnosis !== "all"
						? payload.diagnosis
						: null;

			// Real data: refuse views that would show (or let someone work out) a group of 1-4 people
			if (payload.fake === "real") {
				const cells = await respondentCells(ctx.db, payload.pOrT);
				if (!aggregateViewAllowed(cells, gender, diagnosis)) {
					return { total: matching(cells, gender, diagnosis), hidden: true } as unknown as MainReturn;
				}
			}

			if (payload.fake === "fake") {
				let q = ctx.db.selectFrom(`${payload.pOrT}_fake`).selectAll();
				if (gender) q = q.where("gender", "=", gender);
				if (diagnosis) q = q.where("diagnosis", "=", diagnosis);
				stats = await q.execute();
			} else {
				let q = ctx.db.selectFrom(payload.pOrT).selectAll().where("accepted", "=", true);
				if (gender) q = q.where("gender", "=", gender);
				if (diagnosis) q = q.where("diagnosis", "=", diagnosis);
				stats = await q.execute();
			}

			const responsesTotal: number = stats.length; //TODO use postgres count here

			// Age of onset per gender, for the selected diagnosis (none for "all", or for a gender
			// view without a diagnosis). Real data only counts accepted submissions; fake tables
			// have no `accepted` column.
			const diagnosisFilter = diagnosis;

			const ageOfOnset = (gender: "male" | "female" | "other") => {
				if (payload.fake === "fake") {
					let q = ctx.db
						.selectFrom(`${payload.pOrT}_fake`)
						.select(["age_of_onset"])
						.where("gender", "=", gender);
					if (diagnosisFilter) q = q.where("diagnosis", "=", diagnosisFilter);
					return q.execute();
				}
				let q = ctx.db
					.selectFrom(payload.pOrT)
					.select(["age_of_onset"])
					.where("gender", "=", gender)
					.where("accepted", "=", true);
				if (diagnosisFilter) q = q.where("diagnosis", "=", diagnosisFilter);
				return q.execute();
			};

			const maleAge = await ageOfOnset("male");
			const femaleAge = await ageOfOnset("female");
			const otherAge = await ageOfOnset("other");

			const filterSensitive = stats.map((e: (typeof stats)[0]) => {
				const { user, created_at, id, ...filtered } = e;
				return filtered;
			});

			const automatic: Record<string, any> = {};

			questions.forEach((e) => {
				// "Prefer not to say" answers (sensitive questions only), shown as their own slice/bar
				const declinedCount = isSensitive(payload.pOrT, e.questionDB)
					? filterSensitive.filter((d) => Array.isArray(d.declined) && d.declined.includes(e.questionDB)).length
					: 0;
				if (e.questionType === "yesOrNo") {
					const yesOrNo = filterSensitive.map((i) => i[e.questionDB]);
					automatic[e.questionDB] = {
						yes: yesOrNo.filter((i) => i === true).length,
						no: yesOrNo.filter((i) => i === false).length,
						...(declinedCount ? { prefer_not: declinedCount } : {}),
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
						// Whole years; 0 when nobody of that gender answered (instead of NaN)
						// null = no answers, or (real data) too few to show without revealing someone's age
						const hide = (obj: typeof maleAge) => !obj.length || (payload.fake === "real" && tooSmall(obj.length));
						const average = (obj: typeof maleAge) =>
							hide(obj) ? null : Math.round(obj.reduce((a, b) => a + b.age_of_onset, 0) / obj.length);
						const median = (obj: typeof maleAge) => {
							if (hide(obj)) return null;
							const sorted = obj.map((i) => i.age_of_onset).sort((a, b) => a - b);
							return sorted[Math.floor(sorted.length / 2)];
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
						automatic.current_age = countAgeBrackets(filterSensitive.map((i) => i.current_age));
					}
				} else if (e.questionType === "selection") {
					const selections: Record<string, number> = {};
					e.selections?.forEach((i) => {
						selections[i] = filterSensitive.filter(
							(d) => d[e.questionDB] === i,
						).length;
					});
					automatic[e.questionDB] = selections;
				} else if (e.questionType === "unknown") {
					const selections: Record<string, number> = {};
					["yes", "no", "unknown"].forEach((i) => {
						selections[i] = filterSensitive.filter(
							(d) => d[e.questionDB] === i,
						).length;
					});
					if (declinedCount) selections[PREFER_NOT_LABEL] = declinedCount;
					automatic[e.questionDB] = selections;
				} else if (e.questionType === "text") {
					// Up to 5 random answers
					const allTexts = filterSensitive
						.map((i) => i[e.questionDB])
						.filter((f) => f !== null && f !== undefined && f !== "");
					const picked: unknown[] = [];
					while (picked.length < 5 && allTexts.length) {
						picked.push(allTexts.splice(Math.floor(Math.random() * allTexts.length), 1)[0]);
					}
					automatic[e.questionDB] = picked;
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

			automatic.total = responsesTotal;

			return automatic as MainReturn;
		}
};

export const textPagination = publicProcedure
	.input(
		z.object({
			page: z.number().int().min(0),
			stat: z.string().refine((s) => textStats.has(s), "Unknown text question"),
			gender: z.enum(["Female", "Other", "Male"]).nullable(),
			diagnosis: z.enum(["Schizophrenia", "Schizoaffective"]).nullable(),
			personalOrTheir: z.enum(["Personal_questions", "Their_questions"]),
			fake: z.enum(["real", "fake"]),
		}),
	)
	.query(async ({ input, ctx }) => {
		const payload = input;
		const { ref } = ctx.db.dynamic;

		// Real data: each answer is labelled with gender and diagnosis, and the list can be
		// filtered by them. While any gender × diagnosis group has 1-4 people, both are off:
		// otherwise that group's answers could be picked out (e.g. "male" list ∩ "schizoaffective"
		// list) and linked across questions.
		const labelsAndFilters = payload.fake === "fake" || allCellsSafe(await respondentCells(ctx.db, payload.personalOrTheir));
		if (!labelsAndFilters && (payload.gender || payload.diagnosis)) {
			return { stats: [], count: 0, filtersAvailable: false };
		}
		let statsQuery = ctx.db
			.selectFrom(
				payload.fake === "fake"
					? `${payload.personalOrTheir}_fake`
					: payload.personalOrTheir,
			)
			.select([ref(payload.stat), "gender", "diagnosis"])
			.where(ref(payload.stat), "is not", null);

		if (payload.fake === "real") {
			statsQuery = statsQuery.where("accepted", "=", true);
		}

		if (payload.gender) {
			statsQuery = statsQuery.where(
				"gender",
				"=",
				payload.gender.toLowerCase(),
			);
		}

		if (payload.diagnosis) {
			statsQuery = statsQuery.where(
				"diagnosis",
				"=",
				payload.diagnosis.toLowerCase(),
			);
		}

		const stats = await statsQuery
			// Offset paging needs a fixed order, or pages can repeat or skip rows. Newest first.
			.orderBy("id", "desc")
			.offset(payload.page * 25)
			.limit(25)
			.execute();

		if (!stats) {
			return null;
		}

		// const { count } = ctx.db.fn;

		//TODO there has to better way than this to get count than duplicate functions, ask in kysely discord

		let lengthQuery = ctx.db
			.selectFrom(
				payload.fake === "fake"
					? `${payload.personalOrTheir}_fake`
					: payload.personalOrTheir,
			)
			.select((eb) => eb.fn.count<number>(ref(payload.stat)).as("count"));

		if (payload.fake === "real") {
			lengthQuery = lengthQuery.where("accepted", "=", true);
		}

		if (payload.gender) {
			lengthQuery = lengthQuery.where(
				"gender",
				"=",
				payload.gender.toLowerCase(),
			);
		}

		if (payload.diagnosis) {
			lengthQuery = lengthQuery.where(
				"diagnosis",
				"=",
				payload.diagnosis.toLowerCase(),
			);
		}
		const count = await lengthQuery.executeTakeFirst();

		return {
			stats: labelsAndFilters ? stats : stats.map((row) => ({ ...row, gender: null, diagnosis: null })),
			...count,
			filtersAvailable: labelsAndFilters,
		};
	});

export const articlesPagination = publicProcedure
	.input(
		z.object({
			page: z.number().int().min(0),
			/** Only articles with this topic */
			tag: z.enum(ARTICLE_TAG_KEYS).nullable().default(null),
			sort: z.enum(["newest", "helpful"]).default("newest"),
		}),
	)
	.query(async ({ input: payload, ctx }) => {
		const hasTag = sql<boolean>`tags @> ARRAY[${payload.tag}]::text[]`;
		const userId = ctx.user?.id ?? null;
		const articles = await ctx.db
			.selectFrom("Articles")
			.select((eb) => [
				"id",
				"link",
				"description",
				"tags",
				eb
					.selectFrom("article_votes")
					.select(eb.fn.countAll<number>().as("n"))
					.whereRef("article_votes.article_id", "=", "Articles.id")
					.as("helpful"),
				// For the signed-in user: did they vote, is it their own (votes on those are refused)
				sql<boolean>`exists (select 1 from article_votes v where v.article_id = "Articles".id and v."user" = ${userId})`.as("voted"),
				sql<boolean>`coalesce("Articles"."user" = ${userId}, false)`.as("mine"),
			])
			.where("accepted", "=", true)
			.$if(payload.tag !== null, (qb) => qb.where(hasTag))
			.$if(payload.sort === "helpful", (qb) => qb.orderBy(sql`helpful`, "desc"))
			// Offset paging needs a fixed order, or pages can repeat or skip rows. Newest first.
			.orderBy("created_at", "desc")
			.orderBy("id", "desc")
			.offset(payload.page * 25)
			.limit(25)
			.execute();

		const count = await ctx.db
			.selectFrom("Articles")
			.select((eb) => [eb.fn.countAll("Articles").as("count")])
			.where("accepted", "=", true)
			.$if(payload.tag !== null, (qb) => qb.where(hasTag))
			.executeTakeFirst();

		return { articles, count };
	});

/** Used by the navbar and other islands to show login/admin state. */
export const authStatus = publicProcedure.query(({ ctx }) => ({
	user: Boolean(ctx.user),
	admin: ctx.user?.role === "admin",
}));
