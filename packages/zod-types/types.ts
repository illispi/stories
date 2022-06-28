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
export const hospiCareAfterSatisfaction = z.object({
  hospiCareAfterSatisfaction: z.boolean(),
});
export const psychosisHowMany = z.object({
  psychosisHowMany: z.number().int(),
});
export const prodromalSymptoms = z.object({
  prodromalSymptoms: z.boolean(),
});
export const prodromalSymptomsDescribe = z.object({
  prodromalSymptomsDescribe: z.string(),
});
export const sympHallucinations = z.object({
  sympHallucinations: z.boolean(),
});
export const sympDelusions = z.object({
  sympDelusions: z.boolean(),
});
export const sympParanoia = z.object({
  sympParanoia: z.boolean(),
});
export const sympDisorganized = z.object({
  sympDisorganized: z.boolean(),
});

//BUG following might need nullable() in some spots

export const personalQuestions = z.object({
  gender: z.enum(["female", "male", "other"]),
  currentAge: z.number().int(),
  ageOfOnset: z.number().int(),
  lengthOfPsychosis: z.enum(["few weeks", "few months", "more than 6 months"]),
  hospiOnFirst: z.boolean(),
  hospiVoluntarily: z.boolean(),
  hospiSatisfaction: z.boolean(),
  hospiDescribe: z.string(),
  hospiCareAfter: z.boolean(),
  hospiAfterCareDescribe: z.string(),
  hospiCareAfterSatisfaction: z.boolean(),
  psychosisHowMany: z.number().int(),
  prodromalSymptoms: z.boolean(),
  prodromalSymptomsDescribe: z.string(),
  sympHallucinations: z.boolean(),
  sympDelusions: z.boolean(),
  sympParanoia: z.boolean(),
  sympDisorganized: z.boolean(),
});

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
export type hospiCareAfterSatisfactionType = z.infer<
  typeof hospiCareAfterSatisfaction
>;
export type psychosisHowManyType = z.infer<typeof psychosisHowMany>;
export type prodromalSymptomsType = z.infer<typeof prodromalSymptoms>;
export type prodromalSymptomsDescribeType = z.infer<
  typeof prodromalSymptomsDescribe
>;
export type sympHallucinationsType = z.infer<typeof sympHallucinations>;
export type sympDelusionsType = z.infer<typeof sympDelusions>;
export type sympParanoiaType = z.infer<typeof sympParanoia>;
export type sympDisorganizedType = z.infer<typeof sympDisorganized>;

export type personalQuestions = z.infer<typeof personalQuestions>;

// export const personalQuestions = gender
//   .merge(currentAge)
//   .merge(ageOfOnset)
//   .merge(lengthOfPsychosis)
//   .merge(hospiOnFirst)
//   .merge(hospiVoluntarily)
//   .merge(hospiSatisfaction)
//   .merge(hospiDescribe)
//   .merge(hospiCareAfter)
//   .merge(hospiAfterCareDescribe)
//   .merge(hospiCareAfterSatisfaction)
//   .merge(psychosisHowMany)
//   .merge(prodromalSymptoms)
//   .merge(prodromalSymptomsDescribe);

//NOTE see zod lazy evaluations if the would help
