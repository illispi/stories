import type { TheirQuestions } from "~/types/zodFromTypes";

export interface QuestionTheir {
  question: string;
  questionType:
    | "selection"
    | "integer"
    | "text"
    | "yesOrNo"
    | "multiSelect"
    | "submit";
  questionDB: keyof TheirQuestions;
  selections?: string[];
  multiSelect?: [keyof TheirQuestions, string][];
  skip?: keyof TheirQuestions;
}

export const questions: QuestionTheir[] = [
  {
    question: "What is their diagonosis?",
    questionType: "selection",
    questionDB: "diagnosis",
    selections: ["schizophrenia", "schizoaffective"],
  },
  {
    question: "What is their gender?",
    questionType: "selection",
    questionDB: "gender",
    selections: ["female", "male", "other"],
  },
  {
    question: "How old are they (estimnate is enough)?",
    questionType: "integer",
    questionDB: "current_age",
  },
  {
    question: "Do they have relatives with this illness?",
    questionType: "selection",
    questionDB: "relatives",
    selections: [
      "none",
      "parents",
      "siblings",
      "cousins",
      "grandparents",
      "other",
    ],
  },
  {
    question:
      "What age were they when they first had a psychotic episode (estimate)",
    questionType: "integer",
    questionDB: "age_of_onset",
  },
  {
    question: "How long did their psychotic episodes last?",
    questionType: "selection",
    questionDB: "length_of_psychosis",
    selections: ["few days", "few weeks", "few months", "more than 6 months"],
  },
  {
    question: "Have they been hospitalized for psychotic episode?",
    questionType: "yesOrNo",
    questionDB: "has_been_hospitalized",
    skip: "psychosis_how_many",
  },
  {
    question: "Did you recieve after care following hospitalization?",
    questionType: "yesOrNo",
    questionDB: "care_after_hospital",
  },
  {
    question: "How many times have they had major psychosis? (estimate)",
    questionType: "selection",
    selections: ["once", "twice", "three times", "four times", "five or more"],
    questionDB: "psychosis_how_many",
  },
  {
    question:
      "Did they have prodromal symptoms before they experienced their first psychotic episode?",
    questionType: "yesOrNo",
    questionDB: "prodromal_symptoms",
    skip: "symptoms_hallucinations",
  },
  {
    question: "What kind of prodromal symptoms did they have?",
    questionType: "multiSelect",
    questionDB: "prodromal_anxiety",
    multiSelect: [
      ["prodromal_anxiety", "Anxiety"],
      ["prodromal_depression", "Depression"],
      ["prodromal_mood_swings", "Mood swings"],
      ["prodromal_sleep_disturbances", "Sleep disturbances"],
      ["prodromal_irritability", "Irritability"],
    ],
  },
  {
    question:
      "What kind of symptoms did they have with their psychotic episodes?",
    questionType: "multiSelect",
    questionDB: "symptoms_hallucinations",
    multiSelect: [
      ["symptoms_hallucinations", "Hallucinations"],
      ["symptoms_delusions", "Delusions"],
      ["symptoms_paranoia", "Paranoia"],
      ["symptoms_disorganized", "Disorganized speech"],
    ],
  },
  {
    question:
      "Did the antipsychotic medication help with their positive symptoms?",
    questionType: "yesOrNo",
    questionDB: "med_efficacy",
  },
  {
    question: "Did the antipsychotic medication cause side effects",
    questionType: "yesOrNo",
    questionDB: "had_side_effs",
    skip: "quitting",
  },

  {
    question: "What kind of side effects?",
    questionType: "multiSelect",
    questionDB: "side_effs_dizziness",
    multiSelect: [
      ["side_effs_movement_effects", "Slow movements"],
      ["side_effs_dizziness", "Dizziness"],
      ["side_effs_weight_gain", "Weight gain"],
      ["side_effs_sedation", "Sedation"],
      ["side_effs_tardive", "Tardive dyskinesia"],
      ["side_effs_sexual", "Sexual problems"],
    ],
  },
  {
    question: "Have you stopped taking the antipsychotic medication?",
    questionType: "yesOrNo",
    questionDB: "quitting",
    skip: "gained_weight",
  },
  {
    question: "Were there any consequences to quitting the medication?",
    questionType: "selection",
    selections: ["relapsed", "nothing", "improved"],
    questionDB: "quitting_what_happened",
  },
  {
    question: "Did the medications cause them to gain weight?",
    questionType: "yesOrNo",
    questionDB: "gained_weight",
  },
  {
    question: "Do they smoke cigarettes?",
    questionType: "yesOrNo",
    questionDB: "smoking",
  },
  {
    question: "Have they ever used cannabis?",
    questionType: "yesOrNo",
    questionDB: "cannabis",
  },
  {
    question: "Have they ever attempted suicide?",
    questionType: "yesOrNo",
    questionDB: "suicide_attempts",
  },
  {
    question: "Do they have any negative symptoms?",
    questionType: "yesOrNo",
    questionDB: "negative_symptoms",
    skip: "personality_before",
  },

  {
    question: "What kind of negative symptoms?",
    questionType: "multiSelect",
    questionDB: "flat_expressions",
    multiSelect: [
      ["flat_expressions", "Flat expressions"],
      ["poverty_of_speech", "Poverty of speech"],
      ["anhedonia", "No pleasure"],
      ["no_interest_socially", "No socialization"],
      ["apathy", "Apathy"],
      ["lack_of_motivation", "Lack of motivation"],
    ],
  },
  {
    question: "How would you describe their personality before psychosis?",
    questionType: "text",
    questionDB: "personality_before",
  },
  {
    question: "Did their personality change after psychosis?",
    questionType: "yesOrNo",
    questionDB: "personality_changed",
    skip: "life_situation",
  },
  {
    question: "How did their personality change?",
    questionType: "text",
    questionDB: "personality_after",
  },
  {
    question: "What is their current occupation?",
    questionType: "selection",
    questionDB: "life_situation",
    selections: [
      "unemployed",
      "self employed",
      "employed",
      "disability",
      "student",
      "other",
    ],
  },
  {
    question: "Are they currently in a relationship?",
    questionType: "yesOrNo",
    questionDB: "partner",
  },
  {
    question: "Do they have any friends?",
    questionType: "yesOrNo",
    questionDB: "friends",
  },
  {
    question: "Do they have children?",
    questionType: "yesOrNo",
    questionDB: "children",
  },
  {
    question: "What do you wish people knew about their schizophrenia?",
    questionType: "text",
    questionDB: "what_others_should_know",
  },
  {
    question: "Are you ready to submit",
    questionType: "submit",
    questionDB: "gender", //NOTE this is duplicate due, but its shouldnt cause issues
  },
];
