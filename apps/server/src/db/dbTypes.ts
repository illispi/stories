// import { Generated, ColumnType } from "kysely";

export interface PersonalQuestions {
  after_hospital_satisfaction: boolean | null;
  age_of_onset: number;
  anhedonia: boolean | null;
  answer_personal_id: number;
  apathy: boolean | null;
  cannabis: boolean;
  care_after_hospital: boolean | null;
  children: boolean;
  cognitive_symptoms: boolean;
  cognitive_symptoms_description: string | null;
  created_at: number | null;
  current_age: number;
  current_med: string;
  describe_hospital: string | null;
  describe_prodromal_symptoms: string | null;
  efficacy_of_med: boolean;
  flat_expressions: boolean | null;
  friends: boolean;
  gained_weight: boolean;
  gender: string;
  goals_after: string | null;
  goals_changed: boolean;
  hospital_satisfaction: boolean | null;
  hospitalized_on_first: boolean;
  hospitalized_voluntarily: boolean | null;
  lack_of_motivation: boolean | null;
  length_of_psychosis: string;
  life_disability: boolean | null;
  life_employed: boolean | null;
  life_satisfaction: boolean;
  life_satisfaction_description: string | null;
  life_student: boolean | null;
  life_unemployed: boolean | null;
  negative_symptoms: boolean;
  no_interest_socially: boolean | null;
  not_have_schizophrenia: boolean;
  not_have_schizophrenia_description: string | null;
  other_help: string | null;
  partner: boolean;
  personality_after: string | null;
  personality_before: string;
  personality_changed: boolean;
  poverty_of_speech: boolean | null;
  prodromal_symptoms: boolean;
  psychosis_how_many: number;
  quitting: boolean;
  quitting_regret: boolean | null;
  quitting_what_happened: string | null;
  quitting_why: string | null;
  responded_to_telling: string | null;
  side_effs_dizziness: boolean | null;
  side_effs_movement_effects: boolean | null;
  side_effs_sedation: boolean | null;
  side_effs_sexual: boolean | null;
  side_effs_tardive: boolean | null;
  side_effs_weight_gain: boolean | null;
  smoking: boolean;
  smoking_amount: string | null;
  suicidal_thoughts: boolean;
  suicide_attempts: boolean | null;
  symptoms_delusions: boolean | null;
  symptoms_disorganized: boolean | null;
  symptoms_hallucinations: boolean | null;
  symptoms_paranoia: boolean | null;
  symptoms_that_remained: string | null;
  told_employer: boolean | null;
  told_family: boolean | null;
  told_friends: boolean | null;
  told_if_asked: boolean | null;
  told_nobody: boolean | null;
  user_id: string;
  weight_amount: number | null;
  what_kind_of_care_after: string | null;
  what_others_should_know: string | null;
  worst_symptom: string | null;
}

export interface TheirQuestions {
  age_of_onset: number;
  answer_their_id: number;
  children: boolean | null;
  friends: boolean | null;
  gender: string;
  goals_after: string | null;
  goals_changed: boolean;
  life_disability: boolean | null;
  life_employed: boolean | null;
  life_student: boolean | null;
  life_unemployed: boolean | null;
  med_efficacy: boolean | null;
  negative_symptoms: string | null;
  partner: boolean | null;
  personality_after: string | null;
  personality_before: string;
  personality_changed: boolean;
  quitting: boolean | null;
  relation: string | null;
  side_effects: string | null;
  smoking: boolean | null;
  symptoms_before_onset: string | null;
  symptoms_during_psychosis: string | null;
  treatment: string | null;
  user_id: string;
}

export interface User {
  created_at: number | null;
  modified_at: number | null;
  user_id: string;
}

export interface DB {
  personal_questions: PersonalQuestions;
  their_questions: TheirQuestions;
  user: User;
}
