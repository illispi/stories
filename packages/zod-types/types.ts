import { z } from "zod";

export const gender = z.object({
  gender: z.enum(["female", "male", "other"]),
});
export const currentAge = z.object({
  currentAge: z.number().int(),
});
export const ageOfOnset = z.object({
  ageOfOnset: z.number().int(),
});
export const lengthOfPsychosis = z.object({
  lengthOfPsychosis: z.enum(["few weeks", "few months", "more than 6 months"]),
});
export const hospiOnFirst = z.object({
  hospiOnFirst: z.boolean(),
});
export const hospiVoluntarily = z.object({
  hospiVoluntarily: z.boolean(), //NOTE this should work since its not shown at all if not hospiOnFirst
});
export const hospiSatisfaction = z.object({
  hospiSatisfaction: z.boolean(),
});
export const hospiDescribe = z.object({
  hospiDescribe: z.string(),
});
export const hospiCareAfter = z.object({
  hospiCareAfter: z.boolean(),
});
export const hospiAfterCareDescribe = z.object({
  hospiAfterCareDescribe: z.string(),
});

export const personalQuestions = gender
  .merge(currentAge)
  .merge(ageOfOnset)
  .merge(lengthOfPsychosis)
  .merge(hospiOnFirst)
  .merge(hospiVoluntarily)
  .merge(hospiSatisfaction)
  .merge(hospiDescribe)
  .merge(hospiCareAfter)
  .merge(hospiAfterCareDescribe);

export type genderType = z.infer<typeof gender>;
export type currentAgeType = z.infer<typeof currentAge>;
export type ageOfOnsetType = z.infer<typeof ageOfOnset>;
export type lengthOfPsychosisType = z.infer<typeof lengthOfPsychosis>;
export type hospiOnFirstType = z.infer<typeof hospiOnFirst>;
export type hospiVoluntarilyType = z.infer<typeof hospiVoluntarily>;
export type hospiSatisfactionType = z.infer<typeof hospiSatisfaction>;
export type hospiDescribeType = z.infer<typeof hospiDescribe>;
export type hospiCareAfterType = z.infer<typeof hospiCareAfter>;
export type hospiAfterCareDescribeType = z.infer<typeof hospiAfterCareDescribe>;

export type personalQuestions = z.infer<typeof personalQuestions>;
