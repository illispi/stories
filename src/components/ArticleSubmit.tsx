import { Field, Form, type SubmitHandler, createForm, reset } from "@formisch/solid";
import { type Component, type Setter, createSignal } from "solid-js";
import { TagPicker, tagError } from "~/components/ArticleTags";
import type { ArticleTag } from "~/data/articleTags";
import * as v from "valibot";
import { toWebLink, WEB_LINK_MESSAGE } from "~/utils/articleLink";
import { trpc } from "~/utils/trpc";
import CustomButton from "./CustomButton";
import { showToast } from "./Toast";

const ArticleSchema = v.object({
	link: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(5, "Please enter your link to article."),
		v.maxLength(1000, "Your link is too long"),
		v.check((s) => toWebLink(s) !== null, WEB_LINK_MESSAGE),
	),
	description: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(10, "Article description must be at least 10 characters long."),
		v.maxLength(500, "Max length of article description is 500 characters."),
	),
});

const ArticleSubmit: Component<{ setSubmitVis: Setter<boolean> }> = (props) => {
	const utils = trpc.useContext();
	const articleMut = trpc.postArticle.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
			// Close the form and confirm with a toast instead of a separate success view
			showToast("Your article was submitted for review!");
			reset(articleForm);
			setTags([]);
			setTagsError(null);
			articleMut.reset();
			props.setSubmitVis(false);
		},
		onError: () => showToast("Couldn't submit the article. Please try again.", "error"),
	}));
	const articleForm = createForm({ schema: ArticleSchema });
	// Topics live outside the form: a set of toggle chips, checked on submit
	const [tags, setTags] = createSignal<ArticleTag[]>([]);
	const [tagsError, setTagsError] = createSignal<string | null>(null);
	const handleSubmit: SubmitHandler<typeof ArticleSchema> = (values) => {
		const error = tagError(tags());
		setTagsError(error);
		if (error) return;
		articleMut.mutate({ ...values, tags: tags() });
	};

	return (
		<div>
				<Form of={articleForm} onSubmit={handleSubmit}>
					<div class="m-4 flex flex-col items-center justify-center gap-4">
						<h3 class="text-lg underline underline-offset-4">
							Link to article:
						</h3>
						<Field of={articleForm} path={["link"]}>
							{(field) => (
								<>
									<textarea
										class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
										{...field.props}
										value={field.input ?? ""}
										cols={60}
										rows={3}
										required
										autocomplete="off"
										placeholder="link"
									/>
									{field.errors && <div class="text-red-600">{field.errors[0]}</div>}
								</>
							)}
						</Field>
						<h3 class="text-lg underline underline-offset-4">
							Short description of article:
						</h3>
						<Field of={articleForm} path={["description"]}>
							{(field) => (
								<>
									<textarea
										class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
										{...field.props}
										value={field.input ?? ""}
										cols={60}
										rows={9}
										required
										autocomplete="off"
										placeholder="description"
									/>
									{field.errors && <div class="text-red-600">{field.errors[0]}</div>}
								</>
							)}
						</Field>
						<TagPicker
							value={tags()}
							onChange={(next) => {
								setTags(next);
								if (tagsError()) setTagsError(tagError(next));
							}}
							error={tagsError()}
						/>
						<CustomButton disabled={articleMut.isPending} type="submit">
							Submit
						</CustomButton>
					</div>
				</Form>
		</div>
	);
};

export default ArticleSubmit;
