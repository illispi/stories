import type { Bar, Doughnut, Stat, YesOrNo, Text } from "~/types/types";

export const byDiagnosisTheir: (Stat | YesOrNo | Doughnut | Bar | Text)[] = [
  { type: "stat", stat: "total", name: "Total Responses" },
  {
    type: "doughnut",
    stat: "gender",
    header: "Share of genders",
    function: "dataGender",
  },
  {
    type: "bar",
    stat: "current_age",
    header: "Age of responses",
    function: "dataAgeOfRes",
    options: { distributeSeries: true },
  },
  {
    type: "bar",
    stat: "ageOfOnsetByGender",
    header: "Age of onset",
    function: "dataOnset",
  },
  {
    type: "doughnut",
    stat: "length_of_psychosis",
    header: "Length of typical psychosis",
    function: "dataSelection",
  },
  {
    type: "yesOrNo",
    stat: "has_been_hospitalized",
    header: "Hospitalized on psychosis",
  },
  {
    type: "yesOrNo",
    stat: "care_after_hospital",
    header: "Recieved care after hospitalization",
  },
  {
    type: "bar",
    stat: "psychosis_how_many",
    header: "How many psychosis",
    function: "dataSelection",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 80 },
    },
  },
  {
    type: "yesOrNo",
    stat: "prodromal_symptoms",
    header: "Had prodromal symptoms",
  },
  {
    type: "bar",
    stat: "prodromal_anxiety",
    header: "Prodromal symptoms",
    function: "dataMultiSelect",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 80 },
    },
  },
  {
    type: "bar",
    stat: "symptoms_hallucinations",
    header: "First psychosis symptoms",
    function: "dataMultiSelect",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 80 },
    },
  },
  {
    type: "yesOrNo",
    stat: "med_efficacy",
    header: "Medications helped to psychosis symptoms",
  },
  {
    type: "yesOrNo",
    stat: "had_side_effs",
    header: "Had side effects from medication",
  },
  {
    type: "bar",
    stat: "side_effs_dizziness",
    header: "Side effects from medication",
    function: "dataMultiSelect",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 70 },
    },
  },
  {
    type: "yesOrNo",
    stat: "quitting",
    header: "Have quit medication",
  },
  {
    type: "doughnut",
    function: "dataSelection",
    stat: "quitting_what_happened",
    header: "Happened after quitting medication",
  },
  {
    type: "yesOrNo",
    stat: "gained_weight",
    header: "Have gained weight after medication",
  },
  {
    type: "yesOrNo",
    stat: "smoking",
    header: "Smoking",
  },
  {
    type: "unknown",
    stat: "cannabis",
    function: "dataSelection",
    header: "Has used cannabis",
  },
  {
    type: "unknown",
    stat: "suicide_attempts",
    header: "Has attempted suicide",
    function: "dataSelection",
  },
  {
    type: "yesOrNo",
    stat: "negative_symptoms",
    header: "Has negative symptoms",
  },
  {
    type: "bar",
    stat: "flat_expressions",
    header: "Negative symptoms",
    function: "dataMultiSelect",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 80 },
    },
  },
  {
    type: "text",
    stat: "personality_before",
    header: "Personality before illness",
  },
  {
    type: "yesOrNo",
    stat: "personality_changed",
    header: "Personality changed",
  },
  {
    type: "text",
    stat: "personality_after",
    header: "Personality after illness",
  },
  {
    type: "bar",
    stat: "life_situation",
    header: "Occupancy",
    function: "dataSelection",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 80 },
    },
  },
  {
    type: "yesOrNo",
    stat: "partner",
    header: "Has partner",
  },
  {
    type: "yesOrNo",
    stat: "friends",
    header: "Has friends",
  },
  {
    type: "yesOrNo",
    stat: "children",
    header: "Has children",
  },
  {
    type: "unknown",
    stat: "lost_relationships",
    function: "dataSelection",
    header: "Has lost relationships due to illness",
  },
];
