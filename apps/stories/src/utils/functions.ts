import { MainReturn } from "~/types/types";

export const weightBrackets = (data: MainReturn["weight_amount"]) => {

  if(!data){
    return null
  }

  const brackets = [
    "0-5kg",
    "6-10kg",
    "11-20kg",
    "21-30kg",
    "31-40kg",
    "41-50kg",
    "51-80kg",
    "81-200kg",
  ];

  return {
    labels: brackets,
    series: (Object.keys(data) as Array<keyof typeof data>).map((e) => data[e]),
  };
};

export const dataGender = (data: MainReturn["gender"]) => {
  if(!data){
    return null
  }
  const gender = data;
  const total = gender.male + gender.female + gender.other;

  return {
    labels: [
      `Male ${Math.floor((gender.male / total) * 100)}%`,
      `Female ${Math.floor((gender.female / total) * 100)}%`,
      `Other ${Math.floor((gender.other / total) * 100)}%`,
    ],
    series: [gender.male, gender.female, gender.other],
  };
};

export const dataAgeOfRes = (data) => {
  if(!data){
    return null
  }
  const labelsAgeGroup = [
    "0-9",
    "10-15",
    "16-20",
    "21-25",
    "26-30",
    "31-35",
    "36-80",
  ];

  return {
    labels: labelsAgeGroup,
    series: (Object.keys(data) as Array<keyof typeof data>).map((e) => data[e]),
  };
};
export const dataMultiSelect = (data) => {
  if(!data){
    return null
  }
  const labelsMultiSelect = Object.keys(data);

  const seriesMultiSelect = [];
  for (let i = 0; i < labelsMultiSelect.length; i++) {
    seriesMultiSelect.push(data[labelsMultiSelect[i]]);
  }

  return {
    labels: labelsMultiSelect,
    series: seriesMultiSelect,
  };
};

export const dataSelection = (data) => {
  if(!data){
    return null
  }
  const keysBeforePruning = Object.keys(data);

  const keys = keysBeforePruning.filter((e) => data[e] !== 0);

  let total = 0;

  for (let index = 0; index < keys.length; index++) {
    total += data[keys[index]];
  }

  const series = keys.map((e) => data[e]);

  const labelsPercentage = keys.map(
    (f, i) => `${f} ${Math.floor((series[i] / total) * 100)}%`
  );

  return {
    labels: labelsPercentage,
    series: series,
  };
};

export const dataOnset = (data: MainReturn["ageOfOnsetByGender"]) => {
  if(!data){
    return null
  }
  const onset = data;
  return {
    labels: ["Male", "Female", "Other"],
    series: [
      [onset.maleAverage, onset.femaleAverage, onset.otherAverage],
      [onset.maleMedian, onset.femaleMedian, onset.otherMedian],
    ],
  };
};
