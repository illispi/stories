import { For, Show } from "solid-js";
import { ARTICLE_TAGS, type ArticleTag, MAX_ARTICLE_TAGS, tagLabel } from "~/data/articleTags";

/** Pick one topic in the article forms (radio-style chips). */
export function TagPicker(props: { value: ArticleTag[]; onChange: (tags: ArticleTag[]) => void; error?: string | null }) {
	return (
		<fieldset class="flex w-11/12 flex-col items-center gap-3">
			<legend class="mb-3 text-center text-lg underline underline-offset-4">
				Topic <span class="text-base text-slate-600 no-underline">(pick one)</span>
			</legend>
			<div role="radiogroup" aria-label="Topic" class="flex flex-wrap justify-center gap-2">
				<For each={ARTICLE_TAGS}>
					{([key, label]) => {
						const selected = () => props.value[0] === key;
						return (
							<button
								type="button"
								role="radio"
								aria-checked={selected()}
								class="rounded-full px-4 py-1.5 font-semibold text-sm ring-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
								classList={{
									"bg-fuchsia-600 text-white ring-fuchsia-600": selected(),
									"bg-white text-slate-700 ring-slate-300 hover:bg-fuchsia-50": !selected(),
								}}
								onClick={() => props.onChange([key])}
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
	tags.length === 0 ? "Pick a topic" : tags.length > MAX_ARTICLE_TAGS ? "Pick only one topic" : null;
