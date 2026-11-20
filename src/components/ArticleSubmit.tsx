import { Field, Form, type SubmitHandler, createForm, reset } from "@formisch/solid";
import { type Component, type Setter, Show } from "solid-js";
import * as v from "valibot";
import { toWebLink, WEB_LINK_MESSAGE } from "~/utils/articleLink";
import { trpc } from "~/utils/trpc";
import CustomButton from "./CustomButton";

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
		onSuccess: () => utils.invalidate(),
	}));
	const articleForm = createForm({ schema: ArticleSchema });
	const handleSubmit: SubmitHandler<typeof ArticleSchema> = (values) => {
		articleMut.mutate(values);
	};

	return (
		<div>
			<Show
				when={!articleMut.isSuccess}
				fallback={
					<div class="flex w-full flex-col items-center justify-center">
						<h2 class="font-bold text-lg">
							Your article was submitted for review!
						</h2>
						<CustomButton
							onClick={() => {
								articleMut.reset();
								reset(articleForm);
							}}
						>
							Submit another one
						</CustomButton>
					</div>
				}
			>
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
						<CustomButton disabled={articleMut.isPending} type="submit">
							Submit
						</CustomButton>
					</div>
				</Form>
			</Show>
		</div>
	);
};

export default ArticleSubmit;
