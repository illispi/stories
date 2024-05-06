import { z } from "zod";
import { questions as personalQuestions } from "~/data/personalQuestionsArr";
import { questions as theirQuestions } from "~/data/theirQuestionsArr";
import type { MainReturn } from "~/types/types";
import type { PersonalQuestions } from "~/types/zodFromTypes";
import { ReturnError, apiProcedure } from "../../utils";
import { wrap } from "@typeschema/valibot";
import { Argon2id } from "oslo/password";
import { TRPCError } from "@trpc/server";
import { lucia } from "~/lib/auth/lucia";
import { db } from "~/server/db";
import { maxLength, minLength, object, string } from "valibot";
//TODO remember to only update this every once in a while in production

export const allStats = apiProcedure
	.input(
		z.object({
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
		}),
	)
	.query(async ({ input: payload, ctx }) => {
		{
			let stats;

			const questions =
				payload.pOrT === "Personal_questions"
					? personalQuestions
					: theirQuestions;

			if (payload.fake === "fake") {
				switch (payload.value) {
					case "all":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.execute();

						break;
					case "female":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.where("gender", "=", "female")
							.execute();

						break;
					case "other":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.where("gender", "=", "other")
							.execute();

						break;
					case "male":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.where("gender", "=", "male")
							.execute();

						break;
					case "schizophrenia":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.where("diagnosis", "=", "schizophrenia")
							.execute();

						break;
					case "schizoaffective":
						stats = await ctx.db
							.selectFrom(`${payload.pOrT}_fake`)
							.selectAll()
							.where("diagnosis", "=", "schizoaffective")
							.execute();

						break;

					default:
						break;
				}
			} else {
				switch (payload.value) {
					case "all":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("accepted", "=", true)
							.execute();

						break;
					case "female":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("gender", "=", "female")
							.where("accepted", "=", true)
							.execute();

						break;
					case "other":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("gender", "=", "other")
							.where("accepted", "=", true)
							.execute();

						break;
					case "male":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("gender", "=", "male")
							.where("accepted", "=", true)
							.execute();

						break;
					case "schizophrenia":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("diagnosis", "=", "schizophrenia")
							.where("accepted", "=", true)
							.execute();

						break;
					case "schizoaffective":
						stats = await ctx.db
							.selectFrom(payload.pOrT)
							.selectAll()
							.where("diagnosis", "=", "schizoaffective")
							.where("accepted", "=", true)
							.execute();

						break;

					default:
						break;
				}
			}

			const responsesTotal: number = stats.length; //TODO use postgres count here

			let maleAge = ctx.db
				.selectFrom(`${payload.pOrT}${payload.fake === "fake" ? "_fake" : ""}`)
				.select(["age_of_onset"])
				.where("gender", "=", "male");

			maleAge =
				payload.value === "schizoaffective"
					? await maleAge.where("diagnosis", "=", "schizophrenia").execute()
					: await maleAge.where("diagnosis", "=", "schizoaffective").execute();

			let femaleAge = ctx.db
				.selectFrom(`${payload.pOrT}${payload.fake === "fake" ? "_fake" : ""}`)
				.select(["age_of_onset"])
				.where("gender", "=", "female");

			femaleAge =
				payload.value === "schizoaffective"
					? await femaleAge.where("diagnosis", "=", "schizophrenia").execute()
					: await femaleAge
							.where("diagnosis", "=", "schizoaffective")
							.execute();

			let otherAge = ctx.db
				.selectFrom(`${payload.pOrT}${payload.fake === "fake" ? "_fake" : ""}`)
				.select(["age_of_onset"])
				.where("gender", "=", "other");

			otherAge =
				payload.value === "schizoaffective"
					? await otherAge.where("diagnosis", "=", "schizophrenia").execute()
					: await otherAge.where("diagnosis", "=", "schizoaffective").execute();

			const filterSensitive = stats.map((e: (typeof stats)[0]) => {
				const { user, created_at, id, ...filtered } = e;
				return filtered;
			});

			const automatic: MainReturn = {} as any;

			questions.forEach((e) => {
				if (e.questionType === "yesOrNo") {
					const yesOrNo = filterSensitive.map((i) => i[e.questionDB]);
					automatic[e.questionDB] = {
						yes: yesOrNo.filter((i) => i === true).length,
						no: yesOrNo.filter((i) => i === false).length,
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
						const average = (obj: typeof maleAge) => {
							return obj.reduce((a, b) => a + b.age_of_onset, 0) / obj.length;
						};
						const median = (obj: typeof maleAge) => {
							const arr = obj.map((i) => i.age_of_onset);
							const sorted = arr.sort((a, b) => a - b);
							return sorted[Math.floor(arr.length / 2)];
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
						const resBrackets = {
							b09: 0,
							b1015: 0,
							b1620: 0,
							b2125: 0,
							b2630: 0,
							b3135: 0,
							b3680: 0,
						};
						filterSensitive.forEach((i) => {
							if (i.current_age <= 10) {
								resBrackets.b09++;
							} else if (i.current_age >= 10 && i.current_age <= 15) {
								resBrackets.b1015++;
							} else if (i.current_age >= 16 && i.current_age <= 20) {
								resBrackets.b1620++;
							} else if (i.current_age >= 21 && i.current_age <= 25) {
								resBrackets.b2125++;
							} else if (i.current_age >= 26 && i.current_age <= 30) {
								resBrackets.b2630++;
							} else if (i.current_age >= 31 && i.current_age <= 35) {
								resBrackets.b3135++;
							} else if (i.current_age >= 36 && i.current_age <= 80) {
								resBrackets.b3680++;
							}
						});

						automatic.current_age = resBrackets;
					}
				} else if (e.questionType === "selection") {
					const selections = {};
					e.selections?.forEach((i) => {
						selections[i] = filterSensitive.filter(
							(d) => d[e.questionDB] === i,
						).length;
					});
					automatic[e.questionDB] = selections;
				} else if (e.questionType === "unknown") {
					const selections = {};
					["yes", "no", "unknown"].forEach((i) => {
						selections[i] = filterSensitive.filter(
							(d) => d[e.questionDB] === i,
						).length;
					});
					automatic[e.questionDB] = selections;
				} else if (e.questionType === "text") {
					const allTexts = filterSensitive
						.map((i) => i[e.questionDB])
						.filter((f) => f !== null);

					automatic[e.questionDB] = [];

					for (
						let index = 0;
						index <= (allTexts.length <= 5 ? allTexts.length : 4);
						index++
					) {
						const element =
							allTexts.length === 1
								? 0
								: Math.floor(Math.random() * allTexts.length);

						automatic[e.questionDB].push(allTexts[element]);
						allTexts.splice(element, 1);
					}
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

			//BUG below code soesnt work currently, and its not even used in frontend

			const maleSplit = await ctx.db
				.selectFrom("Personal_questions")
				.select(["length_of_psychosis"])
				.where("gender", "=", "male")
				.where("accepted", "=", true)
				.execute();

			const femaleSplit = await ctx.db
				.selectFrom("Personal_questions")
				.select(["length_of_psychosis"])
				.where("gender", "=", "female")
				.where("accepted", "=", true)
				.execute();
			const otherSplit = await ctx.db
				.selectFrom("Personal_questions")
				.select(["length_of_psychosis"])
				.where("gender", "=", "other")
				.where("accepted", "=", true)
				.execute();

			//BUG above seems to return too little

			/*   const selections = {};
      e.selections?.forEach((i) => {
        selections[i] = filterSensitive.filter(
          (d) => d[e.questionDB] === i
        ).length;
      });
      automatic[e.questionDB] = selections; */

			const lengthPsyFunc = (split) => {
				const object = {};

				const lengthSelections = questions
					.find((q) => q.questionDB === "length_of_psychosis")
					?.selections?.map((r) => r);
				lengthSelections?.forEach((e) => {
					object[e] = split.filter((i) => i.length_of_psychosis === e).length;
				});

				return object;
			};

			automatic.lengthByGender = {
				maleSplit: lengthPsyFunc(maleSplit),
				femaleSplit: lengthPsyFunc(femaleSplit),
				otherSplit: lengthPsyFunc(otherSplit),
			};

			automatic.total = responsesTotal;

			return automatic;
		}
	});

export const textPagination = apiProcedure
	.input(
		z.object({
			page: z.number(),
			stat: z.string() as keyof PersonalQuestions,
			gender: z.enum(["Female", "Other", "Male"]).nullable(),
			diagnosis: z.enum(["Schizophrenia", "Schizoaffective"]).nullable(),
			personalOrTheir: z.enum(["Personal_questions", "Their_questions"]),
			fake: z.enum(["real", "fake"]),
		}),
	)
	.query(async ({ input: payload, ctx }) => {
		let statsQuery = ctx.db
			.selectFrom(
				payload.fake === "fake"
					? `${payload.personalOrTheir}_fake`
					: payload.personalOrTheir,
			)
			.select((eb) => [payload.stat, "gender", "diagnosis"])
			.where(payload.stat, "is not", null);

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
			.select((eb) => eb.fn.count<number>(payload.stat).as("count"));

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

		return { stats, ...count };
	});

export const articlesPagination = apiProcedure
	.input(
		z.object({
			page: z.number().int(),
		}),
	)
	.query(async ({ input: payload, ctx }) => {
		const articles = await ctx.db
			.selectFrom("Articles")
			.select(["link", "description"])
			.where("accepted", "=", true)
			.offset(payload.page * 25)
			.limit(25)
			.execute();

		const count = await ctx.db
			.selectFrom("Articles")
			.select((eb) => [eb.fn.countAll("Articles").as("count")])
			.where("accepted", "=", true)
			.executeTakeFirst();

		return { articles, count };
	});

export const authStatus = apiProcedure.query(async ({ ctx }) => {
	//TODO this is bit hacky
	try {
		if (ctx.session) {
			const user = await ctx.db
				.selectFrom("auth_user")
				.select(["id", "role"])
				.where("id", "=", ctx.user?.id)
				.executeTakeFirstOrThrow();

			if (!user) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "User was not found",
				});
			}
			return true;
		}

		return false;
	} catch (error) {
		const wError = error as ReturnError;
		console.error(wError);
		return wError;
	}
});

export const signIn = apiProcedure
	.input(
		wrap(
			object({
				username: string([
					minLength(4, "Your username is too short, min 4 characters"),
					maxLength(30, "Your username is too long, 30 characters max"),
				]),
				password: string([
					minLength(4, "Your password is too short, min 4 characters"),
					maxLength(255, "Your password is too long, 255 characters max"),
				]),
			}),
		),
	)
	.query(async ({ ctx, input }) => {
		try {
			//BUG should check for username from context
			const existingUser = await db
				.selectFrom("auth_user")
				.selectAll("auth_user")
				.where("username", "=", ctx.user?.id)
				.executeTakeFirst();
			if (!existingUser) {
				// NOTE:
				// Returning immediately allows malicious actors to figure out valid usernames from response times,
				// allowing them to only focus on guessing passwords in brute-force attacks.
				// As a preventive measure, you may want to hash passwords even for invalid usernames.
				// However, valid usernames can be already be revealed with the signup page among other methods.
				// It will also be much more resource intensive.
				// Since protecting against this is none-trivial,
				// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
				// If usernames are public, you may outright tell the user that the username is invalid.
				return "No account yet";
			}

			const validPassword = await new Argon2id().verify(
				existingUser.hashed_password,
				input.password,
			);
			if (!validPassword) {
				return new Response("Incorrect username or password", {
					status: 400,
				});
			}

			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			//BUG res might not have cookie and set!!!
			ctx.res.cookie[sessionCookie.name].set({
				value: sessionCookie.value,
				...sessionCookie.attributes,
			});
			//BUG does this hang since nothing is returned?
			ctx.res.set.redirect = "/";
			return;
		} catch (error) {
			const wError = error as ReturnError;
			console.error(wError);
			return wError;
		}
	});
