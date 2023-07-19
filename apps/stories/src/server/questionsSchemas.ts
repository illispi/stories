import { z } from "zod";

export const personalQuestionsSchema = z
  .object({
    diagnosis: z.enum(["schizophrenia", "schizoaffective"]),
    gender: z.enum(["other", "male", "female"]),
    current_age: z.number().int(),
    age_of_onset: z.number().int(),
    length_of_psychosis: z.enum([
      "few days",
      "few weeks",
      "few months",
      "more than 6 months",
    ]),
    hospitalized_on_first: z.boolean(),
    hospitalized_voluntarily: z.boolean().nullable(),
    hospital_satisfaction: z.boolean().nullable(),
    describe_hospital: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    care_after_hospital: z.boolean().nullable(),
    what_kind_of_care_after: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    after_hospital_satisfaction: z.boolean().nullable(),
    psychosis_how_many: z.enum([
      "once",
      "twice",
      "three times",
      "four times",
      "five or more",
    ]),
    //NOTE these could be in json in database
    prodromal_symptoms: z.boolean(),
    prodromal_anxiety: z.boolean().nullable(),
    prodromal_depression: z.boolean().nullable(),
    prodromal_mood_swings: z.boolean().nullable(),
    prodromal_sleep_disturbances: z.boolean().nullable(),
    prodromal_irritability: z.boolean().nullable(),
    symptoms_hallucinations: z.boolean().nullable(),
    symptoms_delusions: z.boolean().nullable(),
    symptoms_paranoia: z.boolean().nullable(),
    symptoms_disorganized: z.boolean().nullable(),
    current_med: z.enum([
      "risperidone (Risperdal)",
      "quetiapine (Seroquel)",
      "olanzapine (Zyprexa)",
      "ziprasidone (Zeldox)",
      "paliperidone (Invega)",
      "aripiprazole (Abilify)",
      "clozapine (Clozaril)",
      "other",
      "no medication",
    ]),
    efficacy_of_med: z.boolean(),
    had_side_effs: z.boolean(),
    side_effs_movement_effects: z.boolean().nullable(),
    side_effs_dizziness: z.boolean().nullable(),
    side_effs_weight_gain: z.boolean().nullable(),
    side_effs_sedation: z.boolean().nullable(),
    side_effs_tardive: z.boolean().nullable(),
    side_effs_sexual: z.boolean().nullable(),
    quitting: z.boolean(),
    quitting_why: z
      .enum(["side effects", "felt normal", "affordability", "other"])
      .nullable(),
    //NOTE Quitting what happened could be selction and not text
    quitting_what_happened: z
      .enum(["relapsed", "nothing", "felt better"])
      .nullable(),
    quitting_regret: z.boolean().nullable(),
    gained_weight: z.boolean(),
    weight_amount: z
      .number()
      .positive()
      .finite()
      .max(300)
      .min(1)
      .safe()
      .int()
      .nullable(),
    smoking: z.boolean(),
    smoking_amount: z
      .enum([
        "10 a day",
        "20 or more a day",
        "Less than 10 a day",
        "Less than 10 a week",
      ])
      .nullable(),
    cannabis: z.boolean(),
    suicidal_thoughts: z.boolean(),
    suicide_attempts: z.boolean().nullable(),
    negative_symptoms: z.boolean(),
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.hospitalized_voluntarily !== null
      : data.hospitalized_voluntarily === null;
  })
  .refine((data) => {
    return data.suicidal_thoughts
      ? data.suicide_attempts !== null
      : data.suicide_attempts === null;
  })
  .refine((data) => {
    return data.smoking
      ? data.smoking_amount !== null
      : data.smoking_amount === null;
  })
  .refine((data) => {
    return data.quitting
      ? data.quitting_regret !== null
      : data.quitting_regret === null;
  })
  .refine((data) => {
    return data.gained_weight
      ? data.weight_amount !== null
      : data.weight_amount === null;
  })
  .refine((data) => {
    return data.quitting
      ? data.quitting_what_happened !== null
      : data.quitting_what_happened === null;
  })
  .refine((data) => {
    return data.quitting
      ? data.quitting_why !== null
      : data.quitting_why === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_movement_effects !== null
      : data.side_effs_movement_effects === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_tardive !== null
      : data.side_effs_tardive === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_sexual !== null
      : data.side_effs_sexual === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_sedation !== null
      : data.side_effs_sedation === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_weight_gain !== null
      : data.side_effs_weight_gain === null;
  })
  .refine((data) => {
    return data.had_side_effs
      ? data.side_effs_dizziness !== null
      : data.side_effs_dizziness === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.hospital_satisfaction !== null
      : data.hospital_satisfaction === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.care_after_hospital !== null
      : data.care_after_hospital === null;
  })
  .refine((data) => {
    return data.prodromal_symptoms
      ? data.prodromal_anxiety !== null
      : data.prodromal_anxiety === null;
  })
  .refine((data) => {
    return data.prodromal_symptoms
      ? data.prodromal_depression !== null
      : data.prodromal_depression === null;
  })
  .refine((data) => {
    return data.prodromal_symptoms
      ? data.prodromal_mood_swings !== null
      : data.prodromal_mood_swings === null;
  })
  .refine((data) => {
    return data.prodromal_symptoms
      ? data.prodromal_sleep_disturbances !== null
      : data.prodromal_sleep_disturbances === null;
  })
  .refine((data) => {
    return data.prodromal_symptoms
      ? data.prodromal_irritability !== null
      : data.prodromal_irritability === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.care_after_hospital && data.what_kind_of_care_after !== null
      : data.care_after_hospital && data.what_kind_of_care_after === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.care_after_hospital && data.after_hospital_satisfaction !== null
      : data.care_after_hospital && data.after_hospital_satisfaction === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.describe_hospital !== null
      : data.describe_hospital === null;
  });
