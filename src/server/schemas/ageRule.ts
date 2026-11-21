/**
 * Age of onset can't be after the current age. Applied to new submissions only, so older
 * answers that break the rule can still be edited (Your data sends the whole row).
 */
export const onsetNotAfterAge = (data: { current_age: number; age_of_onset: number }) =>
	data.age_of_onset <= data.current_age;

export const ONSET_AFTER_AGE_MESSAGE = "Age of onset can't be higher than current age. Go back and check both ages.";
