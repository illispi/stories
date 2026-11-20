import { isDraftKey, type PollLs } from "~/data/pollDraft";

/** When this device last saved its progress to the account (server time, ms) */
const savedAtKey = (poll: PollLs) => `draft_saved_at_${poll}`;

export const localSnapshot = (poll: PollLs) => {
	const data: Record<string, string> = {};
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && isDraftKey(poll, key)) data[key] = localStorage.getItem(key) ?? "";
	}
	return data;
};

/** Has this device got answers for the poll? */
export const hasLocalAnswers = (poll: PollLs) => {
	try {
		const answers = JSON.parse(localStorage.getItem(poll) ?? "{}");
		return Object.keys(answers).some((k) => k !== "declined");
	} catch {
		return false;
	}
};

/** Replace this device's progress with a saved draft. */
export const restoreSnapshot = (poll: PollLs, data: Record<string, string>, savedAt: number) => {
	for (const key of Object.keys(localSnapshot(poll))) localStorage.removeItem(key);
	for (const [key, value] of Object.entries(data)) if (isDraftKey(poll, key)) localStorage.setItem(key, value);
	setLocalSavedAt(poll, savedAt);
};

export const localSavedAt = (poll: PollLs) => Number(localStorage.getItem(savedAtKey(poll)) ?? 0) || 0;
export const setLocalSavedAt = (poll: PollLs, at: number) => localStorage.setItem(savedAtKey(poll), String(at));
