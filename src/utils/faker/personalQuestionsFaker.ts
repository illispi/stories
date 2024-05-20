import { faker } from "@faker-js/faker";
import { PersonalQuestions } from "~/types/zodFromTypes";

export const createFakeDataPersonal = () => {
	const hospitalized_on_first = faker.helpers.arrayElement([true, false]);
	const care_after_hospital = hospitalized_on_first
		? faker.helpers.arrayElement([true, false])
		: null;
	const prodromal_symptoms = faker.helpers.arrayElement([true, false]);
	const had_side_effs = faker.helpers.arrayElement([true, false]);
	const quitting = faker.helpers.arrayElement([true, false]);
	const gained_weight = faker.helpers.arrayElement([true, false]);
	const smoking = faker.helpers.arrayElement([true, false]);
	const suicidal_thoughts = faker.helpers.arrayElement([true, false]);
	const negative_symptoms = faker.helpers.arrayElement([true, false]);
	const cognitive_symptoms = faker.helpers.arrayElement([true, false]);
	const personality_changed = faker.helpers.arrayElement([true, false]);
	const goals_changed = faker.helpers.arrayElement([true, false]);
	const told_nobody = faker.helpers.arrayElement([true, false]);
	const life_satisfaction = faker.helpers.arrayElement([true, false]);
	const relatives = faker.helpers.arrayElement([true, false]);

	const fakeData: PersonalQuestions = {
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
		hospitalized_on_first: hospitalized_on_first,
		hospitalized_voluntarily: hospitalized_on_first
			? faker.helpers.arrayElement([true, false])
			: null,
		hospital_satisfaction: hospitalized_on_first
			? faker.helpers.arrayElement([true, false])
			: null,
		describe_hospital: hospitalized_on_first
			? faker.lorem
					.paragraphs(20)
					.substring(0, Math.floor(Math.random() * 595) + 4)
			: null,
		care_after_hospital: care_after_hospital,
		what_kind_of_care_after:
			hospitalized_on_first && care_after_hospital
				? faker.lorem
						.paragraphs(20)
						.substring(0, Math.floor(Math.random() * 595) + 4)
				: null,
		after_hospital_satisfaction:
			hospitalized_on_first && care_after_hospital
				? faker.helpers.arrayElement([true, false])
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
		current_med: faker.helpers.arrayElement([
			"risperidone (Risperdal)",
			"quetiapine (Seroquel)",
			"olanzapine (Zyprexa)",
			"ziprasidone (Zeldox)",
			"paliperidone (Invega)",
			"aripiprazole (Abilify)",
			"clozapine (Clozaril)",
			"other",
			"no medication",
		]),
		efficacy_of_med: faker.helpers.arrayElement([true, false]),
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
		quitting_why: quitting
			? faker.helpers.arrayElement([
					"side effects",
					"felt normal",
					"affordability",
					"other",
				])
			: null,
		quitting_what_happened: quitting
			? faker.helpers.arrayElement(["relapsed", "nothing", "improved"])
			: null,
		quitting_regret: quitting
			? faker.helpers.arrayElement([true, false])
			: null,
		gained_weight: gained_weight,
		weight_amount: gained_weight
			? faker.number.int({ min: 1, max: 300 })
			: null,
		smoking: smoking,
		smoking_amount: smoking
			? faker.helpers.arrayElement([
					"10 a day",
					"20 or more a day",
					"Less than 10 a day",
					"Less than 10 a week",
				])
			: null,
		cannabis: faker.helpers.arrayElement([true, false]),
		suicidal_thoughts: suicidal_thoughts,
		suicide_attempts: suicidal_thoughts
			? faker.helpers.arrayElement([true, false])
			: null,
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
		cognitive_symptoms: cognitive_symptoms,
		disorganized_thinking: cognitive_symptoms
			? faker.helpers.arrayElement([true, false])
			: null,
		slow_thinking: cognitive_symptoms
			? faker.helpers.arrayElement([true, false])
			: null,
		difficulty_understanding: cognitive_symptoms
			? faker.helpers.arrayElement([true, false])
			: null,
		poor_concentration: cognitive_symptoms
			? faker.helpers.arrayElement([true, false])
			: null,
		poor_memory: cognitive_symptoms
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
		other_help: faker.lorem
			.paragraphs(20)
			.substring(0, Math.floor(Math.random() * 595) + 4),
		worst_symptom: faker.helpers.arrayElement([
			"negative symptoms",
			"positive symptoms",
			"cognitive symptoms",
		]),
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
		goals_changed: goals_changed,
		goals_after: goals_changed
			? faker.lorem
					.paragraphs(20)
					.substring(0, Math.floor(Math.random() * 595) + 4)
			: null,
		told_family: faker.helpers.arrayElement([true, false]),
		told_nobody: told_nobody,
		told_friends: faker.helpers.arrayElement([true, false]),
		told_if_asked: faker.helpers.arrayElement([true, false]),
		told_employer: faker.helpers.arrayElement([true, false]),
		responded_to_telling: told_nobody
			? faker.lorem
					.paragraphs(20)
					.substring(0, Math.floor(Math.random() * 595) + 4)
			: null,
		life_satisfaction: life_satisfaction,
		life_satisfaction_description: life_satisfaction
			? faker.lorem
					.paragraphs(20)
					.substring(0, Math.floor(Math.random() * 595) + 4)
			: null,
		what_others_should_know: faker.lorem
			.paragraphs(20)
			.substring(0, Math.floor(Math.random() * 595) + 4),
		not_have_schizophrenia: faker.helpers.arrayElement([true, false]),
		not_have_schizophrenia_description: faker.lorem
			.paragraphs(20)
			.substring(0, Math.floor(Math.random() * 595) + 4),
		lost_relationships: faker.helpers.arrayElement([true, false]),
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
		systemMetric: true,
	};

	return fakeData;
};
