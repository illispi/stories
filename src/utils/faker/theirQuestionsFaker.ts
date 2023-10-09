import { faker } from "@faker-js/faker";
import type { TheirQuestions } from "~/types/zodFromTypes";

//TODO maybe test wrong values as well

export const createFakeDataTheir = () => {
  const has_been_hospitalized = faker.helpers.arrayElement([
    "no",
    "yes",
    "unknown",
  ]);
  const care_after_hospital =
    has_been_hospitalized === "yes"
      ? faker.helpers.arrayElement([true, false])
      : null;
  const prodromal_symptoms = faker.helpers.arrayElement([true, false]);
  const had_side_effs = faker.helpers.arrayElement([true, false]);
  const quitting = faker.helpers.arrayElement([true, false]);

  const negative_symptoms = faker.helpers.arrayElement([true, false]);

  const personality_changed = faker.helpers.arrayElement([true, false]);
  const relatives = faker.helpers.arrayElement([true, false]);

  const fakeData: TheirQuestions = {
    diagnosis: faker.helpers.arrayElement(["schizophrenia", "schizoaffective"]),
    gender: faker.helpers.arrayElement(["other", "male", "female"]),
    current_age: faker.number.int({ min: 5, max: 110 }),
    age_of_onset: faker.number.int({ min: 5, max: 110 }),
    length_of_psychosis: faker.helpers.arrayElement([
      "few days",
      "few weeks",
      "few months",
      "more than 6 months",
    ]),
    relation: faker.helpers.arrayElement(["relative", "friend", "acquintance"]),
    has_been_hospitalized: has_been_hospitalized,
    hospital_satisfaction:
      has_been_hospitalized === "yes"
        ? faker.helpers.arrayElement(["no", "yes", "unknown"])
        : null,
    happy: faker.helpers.arrayElement(["no", "yes", "unknown"]),

    care_after_hospital: care_after_hospital,
    after_hospital_satisfaction: care_after_hospital
      ? faker.helpers.arrayElement(["no", "yes", "unknown"])
      : null,

    psychosis_how_many: faker.helpers.arrayElement([
      "once",
      "twice",
      "three times",
      "four times",
      "five or more",
    ]),
    //NOTE these could be in json in database
    prodromal_symptoms: prodromal_symptoms,
    prodromal_anxiety: prodromal_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    prodromal_depression: prodromal_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    prodromal_mood_swings: prodromal_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    prodromal_sleep_disturbances: prodromal_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    prodromal_irritability: prodromal_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    symptoms_hallucinations: faker.helpers.arrayElement([true, false, null]),
    symptoms_delusions: faker.helpers.arrayElement([true, false, null]),
    symptoms_paranoia: faker.helpers.arrayElement([true, false, null]),
    symptoms_disorganized: faker.helpers.arrayElement([true, false, null]),

    med_efficacy: faker.helpers.arrayElement([true, false]),
    had_side_effs: had_side_effs,
    side_effs_movement_effects: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    side_effs_dizziness: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    side_effs_weight_gain: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    side_effs_sedation: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    side_effs_tardive: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    side_effs_sexual: had_side_effs
      ? faker.helpers.arrayElement([true, false])
      : null,
    quitting: quitting,
    quitting_what_happened: quitting
      ? faker.helpers.arrayElement(["relapsed", "nothing", "improved"])
      : null,
    gained_weight: faker.helpers.arrayElement([true, false]),

    smoking: faker.helpers.arrayElement([true, false]),

    cannabis: faker.helpers.arrayElement(["no", "yes", "unknown"]),
    suicide_attempts: faker.helpers.arrayElement(["no", "yes", "unknown"]),

    negative_symptoms: negative_symptoms,
    flat_expressions: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    poverty_of_speech: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    anhedonia: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    no_interest_socially: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    apathy: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    lack_of_motivation: negative_symptoms
      ? faker.helpers.arrayElement([true, false])
      : null,
    personality_before: faker.lorem
      .paragraphs(20)
      .substring(0, Math.floor(Math.random() * 595) + 4),
    personality_changed: personality_changed,
    personality_after: personality_changed
      ? faker.lorem
          .paragraphs(20)
          .substring(0, Math.floor(Math.random() * 595) + 4)
      : null,
    life_situation: faker.helpers.arrayElement([
      "unemployed",
      "self employed",
      "employed",
      "disability",
      "student",
      "other",
    ]),
    partner: faker.helpers.arrayElement([true, false]),
    friends: faker.helpers.arrayElement([true, false]),
    children: faker.helpers.arrayElement([true, false]),
    what_others_should_know: faker.lorem
      .paragraphs(20)
      .substring(0, Math.floor(Math.random() * 595) + 4),
    lost_relationships: faker.helpers.arrayElement(["no", "yes", "unknown"]),
    relatives: relatives,
    relative_cousins: relatives
      ? faker.helpers.arrayElement([true, false])
      : null,
    relative_parents: relatives
      ? faker.helpers.arrayElement([true, false])
      : null,
    relative_grandparents: relatives
      ? faker.helpers.arrayElement([true, false])
      : null,
    relative_other: relatives
      ? faker.helpers.arrayElement([true, false])
      : null,
    relative_siblings: relatives
      ? faker.helpers.arrayElement([true, false])
      : null,
  };

  return fakeData;
};
