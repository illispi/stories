import type { Bar, Doughnut, Stat, YesOrNo, Text } from "~/types/types";


export const byGenderPersonal: (Stat | YesOrNo | Doughnut | Bar | Text)[] = [
  { type: "stat", stat: "total", name: "Total Responses" },
  {
    type: "bar",
    stat: "diagnosis",
    header: "Share of diagnosis",
    function: "dataSelection",
  },
  {
    type: "bar",
    stat: "current_age",
    header: "Age of responses",
    function: "dataAgeOfRes",
   
  },
  //TODO maybe add stat on age of onset if there
  {
    type: "bar",
    stat: "relatives",
    header: "Has relatives with schizophrenia",
    function: "dataSelection",
    
  },
  {
    type: "bar",
    stat: "length_of_psychosis",
    header: "Length of first psychosis",
    function: "dataSelection",
  },
  {
    type: "yesOrNo",
    stat: "hospitalized_on_first",
    header: "Hospitalized on first psychosis",
  },
  {
    type: "yesOrNo",
    stat: "hospital_satisfaction",
    header: "Were satisfied with hospital care",
  },
  {
    type: "text",
    stat: "describe_hospital",
    header: "Hospital care opinions",
  },
  {
    type: "yesOrNo",
    stat: "care_after_hospital",
    header: "Recieved care after hospitalization",
  },
  {
    type: "text",
    stat: "what_kind_of_care_after",
    header: "Care after opinions",
  },
  {
    type: "yesOrNo",
    stat: "after_hospital_satisfaction",
    header: "Were satisifed with after hospitalization care",
  },
  {
    type: "bar",
    stat: "psychosis_how_many",
    header: "How many psychosis",
    function: "dataSelection",
    
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
    
  },
  {
    type: "bar",
    stat: "symptoms_hallucinations",
    header: "First psychosis symptoms",
    function: "dataMultiSelect",
    
  },
  {
    type: "bar",
    stat: "current_med",
    header: "Primary anti-psychotic",
    function: "dataSelection",
    options: {
      distributeSeries: true,
      horizontalBars: true,
      axisY: { offset: 70 },
      reverseData: true,
      height: "500",
    },
  },
  {
    type: "yesOrNo",
    stat: "efficacy_of_med",
    header: "Medications helped to psychosis symptoms",
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
    type: "bar",
    stat: "quitting_why",
    header: "Reasons for quitting medication",
    function: "dataSelection",
  },
  {
    type: "bar",
    function: "dataSelection",
    stat: "quitting_what_happened",
    header: "Happened after quitting medication",
  },
  {
    type: "yesOrNo",
    stat: "quitting_regret",
    header: "Regreted quitting medication",
  },
  {
    type: "yesOrNo",
    stat: "gained_weight",
    header: "Have gained weight after medication",
  },
  {
    type: "bar",
    stat: "weight_amount",
    header: "Weight gained",
    function: "weightBrackets",
    options: {
      distributeSeries: true,
    },
  },
  {
    type: "yesOrNo",
    stat: "smoking",
    header: "Smoking",
  },
  {
    type: "bar",
    stat: "smoking_amount",
    header: "Smoking tobacco amount",
    function: "dataSelection",
  },
  {
    type: "yesOrNo",
    stat: "cannabis",
    header: "Has used cannabis",
  },
  {
    type: "yesOrNo",
    stat: "suicidal_thoughts",
    header: "Has had suicidal thoughts",
  },
  {
    type: "yesOrNo",
    stat: "suicide_attempts",
    header: "Has attempted suicide",
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
    
  },
  {
    type: "yesOrNo",
    stat: "cognitive_symptoms",
    header: "Has cognitive symptoms",
  },
  {
    type: "bar",
    stat: "disorganized_thinking",
    header: "Cognitive symptoms",
    function: "dataMultiSelect",
    
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
    type: "yesOrNo",
    stat: "lost_relationships",
    header: "Has lost relationships due to schizophrenia",
  },
  {
    type: "text",
    stat: "other_help",
    header: "Things that have helped apart from medication",
  },
  {
    type: "bar",
    stat: "worst_symptom",
    header: "Worst base symptom",
    function: "dataSelection",
  },
  {
    type: "bar",
    stat: "life_situation",
    header: "Occupancy",
    function: "dataSelection",
    
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
    header: "Has lost relationships due to schizophrenia",
  },
  {
    type: "yesOrNo",
    stat: "goals_changed",
    header: "Life goals changed",
  },
  {
    type: "text",
    stat: "goals_after",
    header: "How life goals changed",
  },
  {
    type: "bar",
    stat: "told_family",
    header: "Has told about illness",
    function: "dataMultiSelect",
    
  },
  {
    type: "text",
    stat: "responded_to_telling",
    header: "How people responded",
  },

  {
    type: "yesOrNo",
    stat: "life_satisfaction",
    header: "Were satisfied with life",
  },
  {
    type: "text",
    stat: "life_satisfaction_description",
    header: "Life satisfaction",
  },
  {
    type: "text",
    stat: "what_others_should_know",
    header: "Wish people knew about schizophrenia",
  },
  {
    type: "yesOrNo",
    stat: "not_have_schizophrenia",
    header: "Would have chosen not to have schizophrenia",
  },
  {
    type: "text",
    stat: "not_have_schizophrenia_description",
    header: "Reasoning for wanting (or not) having schizophrenia",
  },
];
