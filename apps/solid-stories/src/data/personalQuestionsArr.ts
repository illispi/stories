import { PersonalQuestions } from "zod-types";

//NOTE making questionDB optional might not be the best idea

export interface QuestionPersonal {
  question: string;
  questionType:
    | "selection"
    | "integer"
    | "text"
    | "yesOrNo"
    | "multiSelect"
    | "submit";
  questionDB: keyof PersonalQuestions;
  selections?: string[];
  multiSelect?: [keyof PersonalQuestions, string][];
  skip?: keyof PersonalQuestions;
}

export const questions: QuestionPersonal[] = [
  {
    question: "What is your gender?",
    questionType: "selection",
    questionDB: "gender",
    selections: ["female", "male", "other"],
  },
  {
    question: "How old are you?",
    questionType: "integer",
    questionDB: "current_age",
  },
  {
    question: "What age were you when you first had a psychotic episode",
    questionType: "integer",
    questionDB: "age_of_onset",
  },
  {
    question: "How long did the first psychotic episode last?",
    questionType: "selection",
    questionDB: "length_of_psychosis",
    selections: ["few weeks", "few months", "more than 6 months"],
  },
  {
    question: "Were you hospitalized on your first psychotic episode?",
    questionType: "yesOrNo",
    questionDB: "hospitalized_on_first",
    skip: "psychosis_how_many",
  },
  {
    question: "Were you satisfied with the hospital care you received?",
    questionType: "yesOrNo",
    questionDB: "hospital_satisfaction",
  },
  {
    question: "Were you hospitalized voluntarily?",
    questionType: "yesOrNo",
    questionDB: "hospitalized_voluntarily",
  },
  {
    question: "How would you describe your time in hospital?",
    questionType: "text",
    questionDB: "describe_hospital",
  },
  {
    question: "Did you recieve after care following hospitalization?",
    questionType: "yesOrNo",
    questionDB: "care_after_hospital",
    skip: "psychosis_how_many",
  },
  {
    question:
      "What kind of after care did you receive following hospitalization?",
    questionType: "text",
    questionDB: "what_kind_of_care_after",
  },
  {
    question:
      "Were you satisfied with the after care you received following hospitalization?",
    questionType: "yesOrNo",
    questionDB: "after_hospital_satisfaction",
  },
  {
    question: "How many times have you experienced major psychosis?",
    questionType: "integer",
    questionDB: "psychosis_how_many",
  },
  {
    question:
      "Did you have prodromal symptoms before you experienced your first psychotic episode?",
    questionType: "yesOrNo",
    questionDB: "prodromal_symptoms",
    skip: "symptoms_hallucinations",
  },
  {
    question: "What kind of prodromal symptoms did you have?",
    questionType: "text",
    questionDB: "describe_prodromal_symptoms",
  },
  {
    question:
      "What kind of symptoms did you have with your first psychotic episode?",
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
    question: "What is the primary medication that you have used?",
    questionType: "selection",
    questionDB: "current_med",
    selections: [
      "risperidone (Risperdal)",
      "quetiapine (Seroquel)",
      "olanzapine (Zyprexa)",
      "ziprasidone (Zeldox)",
      "paliperidone (Invega)",
      "aripiprazole (Abilify)",
      "clozapine (Clozaril)",
      "other",
      "no medication",
    ],
  },
  {
    question:
      "Did the antipsychotic medication help with your positive symptoms?",
    questionType: "yesOrNo",
    questionDB: "efficacy_of_med",
  },

  {
    question: "Did the antipsychotic medication cause any side effects?",
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
    question: "Why did you quit the medications?",
    questionType: "selection",
    questionDB: "quitting_why",
    selections: ["side effects", "felt normal", "affordability"],
  },
  {
    question: "Were there any consequences to quitting the medication?",
    questionType: "text",
    questionDB: "quitting_what_happened",
  },
  {
    question: "Do you regret quitting the medication?",
    questionType: "yesOrNo",
    questionDB: "quitting_regret",
  },
  {
    question: "Did the medications cause you to gain weight?",
    questionType: "yesOrNo",
    questionDB: "gained_weight",
    skip: "smoking",
  },
  {
    question: "How much weight did you gain?",
    questionType: "integer",
    questionDB: "weight_amount",
  },
  {
    question: "Do you smoke cigarettes?",
    questionType: "yesOrNo",
    questionDB: "smoking",
    skip: "cannabis",
  },

  {
    question: "How many cigarettes do you smoke?",
    questionType: "selection",
    questionDB: "smoking_amount",
    selections: [
      "Less than 10 a week",
      "Less than 10 a day",
      "10 a day",
      "20 or more a day",
    ],
  },

  {
    question: "Have you ever used cannabis?",
    questionType: "yesOrNo",
    questionDB: "cannabis",
  },
  {
    question: "Have you ever had suicidal thoughts?",
    questionType: "yesOrNo",
    questionDB: "suicidal_thoughts",
    skip: "negative_symptoms",
  },
  {
    question: "Have you ever attempted suicide?",
    questionType: "yesOrNo",
    questionDB: "suicide_attempts",
  },
  {
    question: "Do you have any negative symptoms?",
    questionType: "yesOrNo",
    questionDB: "negative_symptoms",
    skip: "cognitive_symptoms",
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
    question: "Do you think you have cognitive decline?",
    questionType: "yesOrNo",
    questionDB: "cognitive_symptoms",
    skip: "personality_before",
  },
  {
    question: "What kind of cognitive decline?",
    questionType: "text",
    questionDB: "cognitive_symptoms_description",
  },
  {
    question: "How would you describe your personality before psychosis?",
    questionType: "text",
    questionDB: "personality_before",
  },
  {
    question: "Did your personality change after psychosis?",
    questionType: "yesOrNo",
    questionDB: "personality_changed",
    skip: "other_help",
  },

  {
    question: "How did your personality change?",
    questionType: "text",
    questionDB: "personality_after",
  },
  {
    question: "What helps your symptoms other than medication?",
    questionType: "text",
    questionDB: "other_help",
  },
  {
    question: "What is the worst symptom of schizophrenia for you?",
    questionType: "selection",
    questionDB: "worst_symptom",
    selections: [
      "negative symptoms",
      "positive symptoms",
      "cognitive symptoms",
    ],
  },
  {
    question: "What is your current occupation?",
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
    question: "Are you currently in a relationship?",
    questionType: "yesOrNo",
    questionDB: "partner",
  },
  {
    question: "Do you have any friends?",
    questionType: "yesOrNo",
    questionDB: "friends",
  },
  {
    question: "Do you have children?",
    questionType: "yesOrNo",
    questionDB: "children",
  },
  {
    question: "Did your life goals change after experiencing psychosis?",
    questionType: "yesOrNo",
    questionDB: "goals_changed",
    skip: "told_family",
  },
  {
    question: "How did your life goals change?",
    questionType: "text",
    questionDB: "goals_after",
  },
  {
    question: "Have you told anybody you have schizophrenia?",
    questionType: "multiSelect",
    questionDB: "told_family",
    multiSelect: [
      ["told_nobody", "Nobody"],
      ["told_family", "Family"],
      ["told_friends", "Friends"],
      ["told_employer", "Employer"],
      ["told_if_asked", "Only if asked"],
    ],
  },
  {
    question: "How did they respond to you having schizophrenia?",
    questionType: "text",
    questionDB: "responded_to_telling",
  },
  {
    question: "Are you satisfied with life?",
    questionType: "yesOrNo",
    questionDB: "life_satisfaction",
    skip: "what_others_should_know",
  },
  {
    question: "Why or why not are you satisfied with life",
    questionType: "text",
    questionDB: "life_satisfaction_description",
  },
  {
    question: "What do you wish people knew about schizophrenia?",
    questionType: "text",
    questionDB: "what_others_should_know",
  },
  {
    question:
      "If you could have chosen not to have schizophrenia, would you have chosen not to?",
    questionType: "yesOrNo",
    questionDB: "not_have_schizophrenia",
  },
  {
    question: "Why or why not?",
    questionType: "text",
    questionDB: "not_have_schizophrenia_description",
  },

  {
    question: "Are you ready to submit",
    questionType: "submit",
    questionDB: "gender", //NOTE this is duplicate due, but its shouldnt cause issues
  },
];
