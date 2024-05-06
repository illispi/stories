import type { AxisOptions, BarChartOptions } from "chartist";
import type { PersonalQuestions } from "./zodFromTypes";

export interface ChartistData {
  labels: string[];
  series: number[][] | number[];
}

export interface YesOrNo {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo";
  stat: keyof MainReturn;
  header: string;
}
export interface Unknown {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo" | "unknown";
  stat: keyof MainReturn;
  header: string;
}
export interface Doughnut {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo";
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect";
}
export interface Bar {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo";
  options?: BarChartOptions<AxisOptions, AxisOptions>;
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect"
    | "weightBrackets";
}
export interface Text {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo";
  header?: string;
}
export interface Stat {
  type: "bar" | "doughnut" | "stat" | "text" | "yesOrNo";
  name: string;
  stat: keyof PersonalQuestions;
}

export interface MainReturn {
  diagnosis: Diagnosis;
  gender: Gender;
  current_age: { [key: string]: number };
  ageOfOnsetByGender: AgeOfOnsetByGender;
  length_of_psychosis: LengthOfPsychosis;
  hospitalized_on_first: AfterHospitalSatisfaction;
  hospital_satisfaction: AfterHospitalSatisfaction;
  hospitalized_voluntarily: AfterHospitalSatisfaction;
  describe_hospital: string[];
  care_after_hospital: AfterHospitalSatisfaction;
  what_kind_of_care_after: string[];
  after_hospital_satisfaction: AfterHospitalSatisfaction;
  psychosis_how_many: PsychosisHowMany;
  prodromal_symptoms: AfterHospitalSatisfaction;
  describe_prodromal_symptoms: string[];
  symptoms_hallucinations: SymptomsHallucinations;
  current_med: { [key: string]: number };
  efficacy_of_med: AfterHospitalSatisfaction;
  side_effs_dizziness: SideEffsDizziness;
  quitting: AfterHospitalSatisfaction;
  quitting_why: QuittingWhy;
  quitting_what_happened: string[];
  quitting_regret: AfterHospitalSatisfaction;
  gained_weight: AfterHospitalSatisfaction;
  weight_amount: { [key: string]: number };
  smoking: AfterHospitalSatisfaction;
  smoking_amount: SmokingAmount;
  cannabis: AfterHospitalSatisfaction;
  suicidal_thoughts: AfterHospitalSatisfaction;
  suicide_attempts: AfterHospitalSatisfaction;
  negative_symptoms: AfterHospitalSatisfaction;
  flat_expressions: FlatExpressions;
  cognitive_symptoms: AfterHospitalSatisfaction;
  cognitive_symptoms_description: string[];
  personality_before: string[];
  personality_changed: AfterHospitalSatisfaction;
  personality_after: string[];
  other_help: string[];
  worst_symptom: WorstSymptom;
  life_situation: LifeSituation;
  partner: AfterHospitalSatisfaction;
  friends: AfterHospitalSatisfaction;
  children: AfterHospitalSatisfaction;
  goals_changed: AfterHospitalSatisfaction;
  goals_after: string[];
  told_family: ToldFamily;
  responded_to_telling: string[];
  life_satisfaction: AfterHospitalSatisfaction;
  life_satisfaction_description: string[];
  what_others_should_know: string[];
  not_have_schizophrenia: AfterHospitalSatisfaction;
  not_have_schizophrenia_description: string[];
  lengthByGender: LengthByGender;
  total: number;
}

export interface AfterHospitalSatisfaction {
  yes: number;
  no: number;
}

export interface AgeOfOnsetByGender {
  maleAverage: number;
  femaleAverage: number;
  otherAverage: number;
  maleMedian: number;
}

export interface Diagnosis {
  schizophrenia: number;
  schizoaffective: number;
}

export interface FlatExpressions {
  "Flat expressions": number;
  "Poverty of speech": number;
  "No pleasure": number;
  "No socialization": number;
  Apathy: number;
  "Lack of motivation": number;
}

export interface Gender {
  female: number;
  male: number;
  other: number;
}

export interface LengthByGender {
  maleSplit: LengthOfPsychosis;
  femaleSplit: LengthOfPsychosis;
  otherSplit: LengthOfPsychosis;
}

export interface LengthOfPsychosis {
  "few days": number;
  "few weeks": number;
  "few months": number;
  "more than 6 months": number;
}

export interface LifeSituation {
  unemployed: number;
  "self employed": number;
  employed: number;
  disability: number;
  student: number;
  other: number;
}

export interface PsychosisHowMany {
  once: number;
  twice: number;
  "three times": number;
  "four times": number;
  "five or more": number;
}

export interface QuittingWhy {
  "side effects": number;
  "felt normal": number;
  affordability: number;
  other: number;
}

export interface SideEffsDizziness {
  "Slow movements": number;
  Dizziness: number;
  "Weight gain": number;
  Sedation: number;
  "Tardive dyskinesia": number;
  "Sexual problems": number;
}

export interface SmokingAmount {
  "Less than 10 a week": number;
  "Less than 10 a day": number;
  "10 a day": number;
  "20 or more a day": number;
}

export interface SymptomsHallucinations {
  Hallucinations: number;
  Delusions: number;
  Paranoia: number;
  "Disorganized speech": number;
}

export interface ToldFamily {
  Nobody: number;
  Family: number;
  Friends: number;
  Employer: number;
  "Only if asked": number;
}

export interface WorstSymptom {
  "negative symptoms": number;
  "positive symptoms": number;
  "cognitive symptoms": number;
}
