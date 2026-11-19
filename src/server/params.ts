import { questions as personalQuestions } from "~/data/personalQuestionsArr";
import { questions as theirQuestions } from "~/data/theirQuestionsArr";

export const isPOrT = (v: unknown): v is "Personal_questions" | "Their_questions" =>
	v === "Personal_questions" || v === "Their_questions";

export const isFOrT = (v: unknown): v is "real" | "fake" => v === "real" || v === "fake";

export const isQuestionnaire = (v: unknown): v is "personalQuestions" | "theirQuestions" =>
	v === "personalQuestions" || v === "theirQuestions";

const textStats = new Set<string>(
	[...personalQuestions, ...theirQuestions]
		.filter((q) => q.questionType === "text")
		.map((q) => q.questionDB as string),
);
export const isTextStat = (v: unknown): v is string => typeof v === "string" && textStats.has(v);
