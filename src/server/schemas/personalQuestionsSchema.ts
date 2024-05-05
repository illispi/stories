import { z } from "zod";

export const personalQuestionsSchemaCustom = z
  .object({
    diagnosis: z.enum(["schizophrenia", "schizoaffective"]),
    gender: z.enum(["other", "male", "female"]),
    //BUG maybe refine that age_of_onset is smaller than current age
    current_age: z.number().max(110).min(5).int(),
    age_of_onset: z.number().max(110).min(5).int(),
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
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
    care_after_hospital: z.boolean().nullable(),
    what_kind_of_care_after: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
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
      .enum(["relapsed", "nothing", "improved"])
      .nullable(),
    quitting_regret: z.boolean().nullable(),
    gained_weight: z.boolean(),
    weight_amount: z.number().max(300).min(1).int().nullable(),
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
    flat_expressions: z.boolean().nullable(),
    poverty_of_speech: z.boolean().nullable(),
    anhedonia: z.boolean().nullable(),
    no_interest_socially: z.boolean().nullable(),
    apathy: z.boolean().nullable(),
    lack_of_motivation: z.boolean().nullable(),
    cognitive_symptoms: z.boolean(),
    disorganized_thinking: z.boolean().nullable(),
    slow_thinking: z.boolean().nullable(),
    difficulty_understanding: z.boolean().nullable(),
    poor_concentration: z.boolean().nullable(),
    poor_memory: z.boolean().nullable(),
    personality_before: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    personality_changed: z.boolean(),
    personality_after: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
    other_help: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    worst_symptom: z.enum([
      "negative symptoms",
      "positive symptoms",
      "cognitive symptoms",
    ]),
    life_situation: z.enum([
      "unemployed",
      "self employed",
      "employed",
      "disability",
      "student",
      "other",
    ]),
    partner: z.boolean(),
    friends: z.boolean(),
    children: z.boolean(),
    goals_changed: z.boolean(),
    goals_after: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
    told_family: z.boolean(),
    told_nobody: z.boolean(),
    told_friends: z.boolean(),
    told_if_asked: z.boolean(),
    told_employer: z.boolean(),
    responded_to_telling: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
    life_satisfaction: z.boolean(),
    life_satisfaction_description: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough')
      .nullable(),
    what_others_should_know: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    not_have_schizophrenia: z.boolean(),
    not_have_schizophrenia_description: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),

    lost_relationships: z.boolean(),
    relatives: z.boolean(),
    relative_cousins: z.boolean().nullable(),
    relative_parents: z.boolean().nullable(),
    relative_siblings: z.boolean().nullable(),
    relative_grandparents: z.boolean().nullable(),
    relative_other: z.boolean().nullable(),
  })
  .refine(
    (data) => {
      return data.hospitalized_on_first
        ? data.hospitalized_voluntarily !== null
        : !data?.hospitalized_voluntarily;
    },
    { message: "1" }
  )
  .refine(
    (data) => {
      return data.told_nobody
        ? data.responded_to_telling !== null
        : !data?.responded_to_telling;
    },
    { message: "4" }
  )
  .refine(
    (data) => {
      return data.goals_changed
        ? data.goals_after !== null
        : !data?.goals_after;
    },
    { message: "5" }
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
      return data.cognitive_symptoms
        ? data.disorganized_thinking !== null
        : !data?.disorganized_thinking;
    },
    { message: "7" }
  )
  .refine(
    (data) => {
      return data.cognitive_symptoms
        ? data.poor_memory !== null
        : !data?.poor_memory;
    },
    { message: "8" }
  )
  .refine(
    (data) => {
      return data.cognitive_symptoms
        ? data.poor_concentration !== null
        : !data?.poor_concentration;
    },
    { message: "9" }
  )
  .refine(
    (data) => {
      return data.cognitive_symptoms
        ? data.difficulty_understanding !== null
        : !data?.difficulty_understanding;
    },
    { message: "10" }
  )
  .refine(
    (data) => {
      return data.cognitive_symptoms
        ? data.slow_thinking !== null
        : !data?.slow_thinking;
    },
    { message: "11" }
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
      return data.suicidal_thoughts
        ? data.suicide_attempts !== null
        : !data?.suicide_attempts;
    },
    { message: "18" }
  )
  .refine(
    (data) => {
      return data.smoking
        ? data.smoking_amount !== null
        : !data?.smoking_amount;
    },
    { message: "19" }
  )
  .refine(
    (data) => {
      return data.quitting
        ? data.quitting_regret !== null
        : !data?.quitting_regret;
    },
    { message: "20" }
  )
  .refine(
    (data) => {
      return data.gained_weight
        ? data.weight_amount !== null
        : !data?.weight_amount;
    },
    { message: "21" }
  )
  .refine(
    (data) => {
      return data.quitting
        ? data.quitting_what_happened !== null
        : !data?.quitting_what_happened;
    },
    { message: "22" }
  )
  .refine(
    (data) => {
      return data.quitting ? data.quitting_why !== null : !data?.quitting_why;
    },
    { message: "23" }
  )
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
      return data.hospitalized_on_first
        ? data.hospital_satisfaction !== null
        : !data?.hospital_satisfaction;
    },
    { message: "30" }
  )
  .refine(
    (data) => {
      return data.hospitalized_on_first
        ? data.care_after_hospital !== null
        : !data?.care_after_hospital;
    },
    { message: "31" }
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
      if (data.hospitalized_on_first && data.care_after_hospital) {
        return data.what_kind_of_care_after !== null;
      } else {
        return !data?.what_kind_of_care_after;
      }
    },
    { message: "37" }
  )
  .refine(
    (data) => {
      if (data.hospitalized_on_first && data.care_after_hospital) {
        return data.after_hospital_satisfaction !== null;
      } else {
        return !data?.after_hospital_satisfaction;
      }
    },
    { message: "38" }
  )
  .refine(
    (data) => {
      return data.relatives
        ? data.relative_cousins !== null
        : !data?.relative_cousins;
    },
    { message: "38" }
  )
  .refine(
    (data) => {
      return data.relatives
        ? data.relative_parents !== null
        : !data?.relative_parents;
    },
    { message: "39" }
  )
  .refine(
    (data) => {
      return data.relatives
        ? data.relative_siblings !== null
        : !data?.relative_siblings;
    },
    { message: "40" }
  )
  .refine(
    (data) => {
      return data.relatives
        ? data.relative_grandparents !== null
        : !data?.relative_grandparents;
    },
    { message: "41" }
  )
  .refine(
    (data) => {
      return data.relatives
        ? data.relative_other !== null
        : !data?.relative_other;
    },
    { message: "42" }
  )
  .refine(
    (data) => {
      return data.hospitalized_on_first
        ? data.describe_hospital !== null
        : !data?.describe_hospital;
    },
    { message: "39" }
  );