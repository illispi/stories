import type { AgeOfOnsetByGender, Gender, MainReturn } from "~/types/types";

type Counts = Record<string, number>;

export const weightBrackets = (data: MainReturn["weight_amount"]) => {
  if (!data) {
    return null;
  }

  const brackets = [
    "0-5",
    "6-10",
    "11-20",
    "21-30",
    "31-40",
    "41-50",
    "51-80",
    "81-200",
  ];

  const keys = Object.keys(data);
  const series = keys.map((e) => data[e]);
  let total = 0;

  for (let index = 0; index < keys.length; index++) {
    total += data[keys[index]];
  }

  const bracketsPercentage = brackets.map(
    (f, i) => `${f} ${Math.floor((series[i] / total) * 100)}%`
  );

  return {
    labels: bracketsPercentage,
    series: (Object.keys(data) as Array<keyof typeof data>).map((e) => data[e]),
  };
};

export const dataGender = (data: MainReturn["gender"]) => {
  if (!data) {
    return null;
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

/** Age groups from the server (keys in group order, see ~/utils/ageBrackets), with shares. */
export const dataAgeOfRes = (data: Counts | null | undefined) => {
  if (!data) {
    return null;
  }
  const keys = Object.keys(data);
  const series = keys.map((key) => data[key]);
  const total = series.reduce((sum, n) => sum + n, 0);

  return {
    labels: keys.map(
      (key, i) => `${key} ${total ? Math.floor((series[i] / total) * 100) : 0}%`
    ),
    series,
  };
};
export const dataMultiSelect = (data: Counts | null | undefined) => {
  if (!data) {
    return null;
  }
  const keys = Object.keys(data);
  const series = keys.map((e) => data[e]);
  let total = 0;

  for (let index = 0; index < keys.length; index++) {
    total += data[keys[index]];
  }

  const labelsPercentage = keys.map(
    (f, i) => `${f} ${Math.floor((series[i] / total) * 100)}%`
  );

  const seriesMultiSelect: number[] = [];
  for (let i = 0; i < keys.length; i++) {
    seriesMultiSelect.push(data[keys[i]]);
  }

  return {
    labels: labelsPercentage,
    series: seriesMultiSelect,
  };
};

export const dataSelection = (data: Counts | null | undefined) => {
  if (!data) {
    return null;
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
  if (!data) {
    return null;
  }
  const onset = data;
  // null: no answers yet, or too few to show without revealing someone's age
  const label = (name: string, v: number | null) => `${name}, ${v === null ? "too few answers" : Math.round(v)}`;
  return {
    labels: [
      label("Male", onset.maleAverage),
      label("Female", onset.femaleAverage),
      label("Other", onset.otherAverage),
    ],
    series: [onset.maleAverage, onset.femaleAverage, onset.otherAverage].map((v) => Math.round(v ?? 0)),
  };
};

export const selector = (
  selection:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect"
    | "weightBrackets",
  rawData: unknown
) => {
  switch (selection) {
    case "dataAgeOfRes":
      return dataAgeOfRes(rawData as Counts);

    case "dataGender":
      return dataGender(rawData as Gender);

    case "dataMultiSelect":
      return dataMultiSelect(rawData as Counts);

    case "dataOnset":
      return dataOnset(rawData as AgeOfOnsetByGender);
    case "dataSelection":
      return dataSelection(rawData as Counts);
    case "weightBrackets":
      return weightBrackets(rawData as Counts);

    default:
      break;
  }
};
