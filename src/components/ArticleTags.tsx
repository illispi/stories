import { For, Show } from "solid-js";
import { ARTICLE_TAGS, type ArticleTag, MAX_ARTICLE_TAGS, tagLabel } from "~/data/articleTags";

/** Toggle chips for choosing 1-3 topics in the article forms. */
export function TagPicker(props: { value: ArticleTag[]; onChange: (tags: ArticleTag[]) => void; error?: string | null }) {
	const toggle = (tag: ArticleTag) =>
		props.onChange(props.value.includes(tag) ? props.value.filter((t) => t !== tag) : [...props.value, tag]);
	const full = () => props.value.length >= MAX_ARTICLE_TAGS;

	return (
		<fieldset class="flex w-11/12 flex-col items-center gap-3">
			<legend class="mb-3 text-center text-lg underline underline-offset-4">
				Topics <span class="text-base text-slate-600 no-underline">(pick 1-{MAX_ARTICLE_TAGS})</span>
			</legend>
			<div class="flex flex-wrap justify-center gap-2">
				<For each={ARTICLE_TAGS}>
					{([key, label]) => {
						const selected = () => props.value.includes(key);
						return (
							<button
								type="button"
								aria-pressed={selected()}
								disabled={!selected() && full()}
								class="rounded-full px-4 py-1.5 font-semibold text-sm ring-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 disabled:opacity-40"
								classList={{
									"bg-fuchsia-600 text-white ring-fuchsia-600": selected(),
									"bg-white text-slate-700 ring-slate-300 hover:bg-fuchsia-50": !selected(),
								}}
								onClick={() => toggle(key)}
							>
								{label}
							</button>
						);
					}}
				</For>
			</div>
			<Show when={props.error}>
				<p class="text-red-600">{props.error}</p>
			</Show>
		</fieldset>
	);
}

/** Read-only topic chips shown with an article. */
export function TagChips(props: { tags: readonly string[] | null | undefined }) {
	return (
		<Show when={props.tags?.length}>
			<ul class="flex flex-wrap justify-center gap-2" aria-label="Topics">
				<For each={props.tags}>
					{(tag) => (
						<li class="rounded-full bg-fuchsia-50 px-3 py-1 font-semibold text-fuchsia-800 text-xs ring-1 ring-fuchsia-200">
							{tagLabel(tag)}
						</li>
					)}
				</For>
			</ul>
		</Show>
	);
}

/** Validation for the client forms (the server checks the same). */
export const tagError = (tags: ArticleTag[]) =>
	tags.length === 0 ? "Pick at least one topic" : tags.length > MAX_ARTICLE_TAGS ? `Pick at most ${MAX_ARTICLE_TAGS} topics` : null;
