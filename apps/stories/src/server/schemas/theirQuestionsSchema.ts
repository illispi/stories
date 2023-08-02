import { z } from "zod";

export const theirQuestionsSchemaCustom = z
  .object({
    gender: z.enum(["male", "female", "other"]),
    length_of_psychosis: z.enum([
      "few days",
      "few weeks",
      "few months",
      "more than 6 months",
    ]),
    relation: z.enum(["relative", "friend", "acquintance"]),
    current_age: z.number().max(110).min(5).int(),
    age_of_onset: z.number().max(110).min(5).int(),
    med_efficacy: z.boolean().nullable(),
    had_side_effs: z.boolean(),
    side_effs_movement_effects: z.boolean().nullable(),
    side_effs_dizziness: z.boolean().nullable(),
    side_effs_weight_gain: z.boolean().nullable(),
    side_effs_sedation: z.boolean().nullable(),
    side_effs_tardive: z.boolean().nullable(),
    side_effs_sexual: z.boolean().nullable(),
    quitting: z.boolean(),
    quitting_what_happened: z
      .enum(["relapsed", "nothing", "improved"])
      .nullable(),
    negative_symptoms: z.boolean(),
    flat_expressions: z.boolean().nullable(),
    poverty_of_speech: z.boolean().nullable(),
    anhedonia: z.boolean().nullable(),
    no_interest_socially: z.boolean().nullable(),
    apathy: z.boolean().nullable(),
    lack_of_motivation: z.boolean().nullable(),
    smoking: z.boolean().nullable(),
    personality_before: z.string(),
    personality_changed: z.boolean(),
    personality_after: z.string().nullable(),
    prodromal_symptoms: z.boolean(),
    prodromal_anxiety: z.boolean().nullable(),
    prodromal_depression: z.boolean().nullable(),
    prodromal_mood_swings: z.boolean().nullable(),
    prodromal_sleep_disturbances: z.boolean().nullable(),
    prodromal_irritability: z.boolean().nullable(),
    life_situation: z.enum([
      "unemployed",
      "self employed",
      "employed",
      "disability",
      "student",
      "other",
    ]),
    partner: z.boolean().nullable(),
    friends: z.boolean().nullable(),
    children: z.boolean().nullable(),
    relatives: z.enum([
      "parents",
      "none",
      "siblings",
      "cousins",
      "grandparents",
      "other",
    ]),
    symptoms_hallucinations: z.boolean().nullable(),
    symptoms_delusions: z.boolean().nullable(),
    symptoms_paranoia: z.boolean().nullable(),
    symptoms_disorganized: z.boolean().nullable(),
    what_others_should_know: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    diagnosis: z.enum(["schizophrenia", "schizoaffective"]),
    lost_relationships: z.enum(["yes", "no", "unknown"]),

    care_after_hospital: z.boolean().nullable(),
    psychosis_how_many: z.enum([
      "once",
      "twice",
      "three times",
      "four times",
      "five or more",
    ]),
    gained_weight: z.boolean(),
    cannabis: z.enum(["yes", "no", "unknown"]),
    suicide_attempts: z.enum(["yes", "no", "unknown"]),
    //TODO these below four need to be updated in everywhere
    has_been_hospitalized: z.enum(["yes", "no", "unknown"]),
    hospital_satisfaction: z.enum(["yes", "no", "unknown"]).nullable(),
    after_hospital_satisfaction: z.enum(["yes", "no", "unknown"]).nullable(),
    happy: z.enum(["yes", "no", "unknown"]),
  })
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_movement_effects !== null
        : !data?.side_effs_movement_effects;
    },
    { message: "24" }
  )
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_tardive !== null
        : !data?.side_effs_tardive;
    },
    { message: "25" }
  )
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_sexual !== null
        : !data?.side_effs_sexual;
    },
    { message: "26" }
  )
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_sedation !== null
        : !data?.side_effs_sedation;
    },
    { message: "27" }
  )
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_weight_gain !== null
        : !data?.side_effs_weight_gain;
    },
    { message: "28" }
  )
  .refine(
    (data) => {
      return data.had_side_effs
        ? data.side_effs_dizziness !== null
        : !data?.side_effs_dizziness;
    },
    { message: "29" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms
        ? data.flat_expressions !== null
        : !data?.flat_expressions;
    },
    { message: "12" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms
        ? data.lack_of_motivation !== null
        : !data?.lack_of_motivation;
    },
    { message: "13" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms ? data.apathy !== null : !data?.apathy;
    },
    { message: "14" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms
        ? data.no_interest_socially !== null
        : !data?.no_interest_socially;
    },
    { message: "15" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms
        ? data.anhedonia !== null
        : !data?.anhedonia;
    },
    { message: "16" }
  )
  .refine(
    (data) => {
      return data.negative_symptoms
        ? data.poverty_of_speech !== null
        : !data?.poverty_of_speech;
    },
    { message: "17" }
  )
  .refine(
    (data) => {
      return data.personality_changed
        ? data.personality_after !== null
        : !data?.personality_after;
    },
    { message: "6" }
  )
  .refine(
    (data) => {
      return data.prodromal_symptoms
        ? data.prodromal_anxiety !== null
        : !data?.prodromal_anxiety;
    },
    { message: "32" }
  )
  .refine(
    (data) => {
      return data.prodromal_symptoms
        ? data.prodromal_depression !== null
        : !data?.prodromal_depression;
    },
    { message: "33" }
  )
  .refine(
    (data) => {
      return data.prodromal_symptoms
        ? data.prodromal_mood_swings !== null
        : !data?.prodromal_mood_swings;
    },
    { message: "34" }
  )
  .refine(
    (data) => {
      return data.prodromal_symptoms
        ? data.prodromal_sleep_disturbances !== null
        : !data?.prodromal_sleep_disturbances;
    },
    { message: "35" }
  )
  .refine(
    (data) => {
      return data.prodromal_symptoms
        ? data.prodromal_irritability !== null
        : !data?.prodromal_irritability;
    },
    { message: "36" }
  )
  .refine(
    (data) => {
      return data.has_been_hospitalized
        ? data.care_after_hospital !== null
        : !data?.care_after_hospital;
    },
    { message: "31" }
  );

export type QuestionsPersonalZodTypes = z.infer<
  typeof theirQuestionsSchemaCustom
>;
