import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Account {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  refresh_token_expires_in: number | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  user: string;
}

export interface PersonalQuestions {
  id: Generated<number>;
  user: string;
  diagnosis: string;
  gender: string;
  current_age: number;
  age_of_onset: number;
  length_of_psychosis: string;
  hospitalized_on_first: boolean;
  hospitalized_voluntarily: boolean | null;
  hospital_satisfaction: boolean | null;
  describe_hospital: string | null;
  care_after_hospital: boolean | null;
  what_kind_of_care_after: string | null;
  after_hospital_satisfaction: boolean | null;
  psychosis_how_many: string;
  prodromal_symptoms: boolean;
  prodromal_anxiety: boolean | null;
  prodromal_depression: boolean | null;
  prodromal_mood_swings: boolean | null;
  prodromal_sleep_disturbances: boolean | null;
  prodromal_irritability: boolean | null;
  symptoms_hallucinations: boolean | null;
  symptoms_delusions: boolean | null;
  symptoms_paranoia: boolean | null;
  symptoms_disorganized: boolean | null;
  current_med: string;
  efficacy_of_med: boolean;
  had_side_effs: boolean;
  side_effs_movement_effects: boolean | null;
  side_effs_dizziness: boolean | null;
  side_effs_weight_gain: boolean | null;
  side_effs_sedation: boolean | null;
  side_effs_tardive: boolean | null;
  side_effs_sexual: boolean | null;
  quitting: boolean;
  quitting_why: string | null;
  quitting_what_happened: string | null;
  quitting_regret: boolean | null;
  gained_weight: boolean;
  weight_amount: number | null;
  smoking: boolean;
  smoking_amount: string | null;
  cannabis: boolean;
  suicidal_thoughts: boolean;
  suicide_attempts: boolean | null;
  negative_symptoms: boolean;
  flat_expressions: boolean | null;
  poverty_of_speech: boolean | null;
  anhedonia: boolean | null;
  no_interest_socially: boolean | null;
  apathy: boolean | null;
  lack_of_motivation: boolean | null;
  cognitive_symptoms: boolean;
  disorganized_thinking: boolean | null;
  slow_thinking: boolean | null;
  difficulty_understanding: boolean | null;
  poor_concentration: boolean | null;
  poor_memory: boolean | null;
  personality_before: string;
  personality_changed: boolean;
  personality_after: string | null;
  other_help: string | null;
  worst_symptom: string;
  life_situation: string;
  partner: boolean;
  friends: boolean;
  children: boolean;
  goals_changed: boolean;
  goals_after: string | null;
  told_family: boolean | null;
  told_nobody: boolean | null;
  told_friends: boolean | null;
  told_if_asked: boolean | null;
  told_employer: boolean | null;
  responded_to_telling: string | null;
  life_satisfaction: boolean;
  life_satisfaction_description: string | null;
  what_others_should_know: string | null;
  not_have_schizophrenia: boolean;
  not_have_schizophrenia_description: string | null;
  created_at: Generated<Timestamp | null>;
}

export interface Session {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
  user: string;
}

export interface TheirQuestions {
  id: Generated<number>;
  user_id: string;
  relation: string;
  gender: string;
  age_of_onset: number;
  treatment: string | null;
  symptoms_before_onset: string | null;
  symptoms_during_psychosis: string | null;
  med_efficacy: boolean | null;
  side_effects: string | null;
  quitting: boolean | null;
  smoking: boolean | null;
  negative_symptoms: string | null;
  personality_before: string;
  personality_changed: boolean;
  personality_after: string | null;
  life_unemployed: boolean | null;
  life_disability: boolean | null;
  life_employed: boolean | null;
  life_student: boolean | null;
  partner: boolean | null;
  friends: boolean | null;
  children: boolean | null;
  goals_changed: boolean;
  goals_after: string | null;
}

export interface User {
  id: Generated<string>;
  name: string | null;
  email: string | null;
  emailVerified: Timestamp | null;
  image: string | null;
}

export interface VerificationToken {
  identifier: string | null;
  token: string | null;
  expires: Timestamp | null;
}

export interface DB {
  account: Account;
  personal_questions: PersonalQuestions;
  session: Session;
  their_questions: TheirQuestions;
  user: User;
  VerificationToken: VerificationToken;
}
