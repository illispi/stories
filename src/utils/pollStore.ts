/**
 * Poll progress for the open poll, kept in memory and saved to the account (poll_drafts).
 * Nothing is stored in the browser. It has the same small API as localStorage (which the poll
 * used before), so the question code reads and writes it the same way.
 */
import { isDraftKey, type PollLs } from "~/data/pollDraft";

const data = new Map<string, string>();
let listener: (() => void) | null = null;
const changed = () => listener?.();

export const pollStore = {
	getItem: (key: string) => data.get(key) ?? null,
	setItem: (key: string, value: string) => {
		data.set(key, String(value));
		changed();
	},
	removeItem: (key: string) => {
		data.delete(key);
		changed();
	},
	clear: () => {
		data.clear();
		changed();
	},
};

/** Called after every change (the poll page saves to the account from here). */
export const onPollStoreChange = (fn: (() => void) | null) => {
	listener = fn;
};

/** Replace the store with progress loaded from the account (or nothing). */
export const loadPollStore = (entries: Record<string, string> | null | undefined) => {
	data.clear();
	for (const [key, value] of Object.entries(entries ?? {})) data.set(key, value);
};

/** This poll's entries, as saved to the account. */
export const pollSnapshot = (poll: PollLs) => {
	const out: Record<string, string> = {};
	for (const [key, value] of data) if (isDraftKey(poll, key)) out[key] = value;
	return out;
};

/** Has the poll got any answers yet? */
export const hasAnswers = (poll: PollLs) => {
	try {
		const answers = JSON.parse(data.get(poll) ?? "{}");
		return Object.keys(answers).some((k) => k !== "declined");
	} catch {
		return false;
	}
};

/**
 * The poll used to keep progress in localStorage. Remove any left there, so no answers stay
 * behind in a browser (e.g. on a shared computer).
 */
export const removeLegacyLocalProgress = () => {
	try {
		const legacy = (key: string) =>
			isDraftKey("personalQuestions", key) ||
			isDraftKey("theirQuestions", key) ||
			key.startsWith("draft_saved_at_") ||
			key.startsWith("progress_owner_");
		for (const key of Object.keys(localStorage)) if (legacy(key)) localStorage.removeItem(key);
	} catch {
		// storage unavailable: nothing to clean
	}
};
