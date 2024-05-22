import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { type Component, type Setter, Show } from "solid-js";
import { type Input, maxLength, minLength, object, string } from "valibot";
import { trpc } from "~/utils/trpc";
import CustomButton from "./CustomButton";

const ArticleSchema = object({
	link: string([
		minLength(5, "Please enter your link to article."),
		maxLength(1000, "Your link is too long"),
	]),
	description: string([
		minLength(10, "Article description must be at least 10 characters long."),
		maxLength(500, "Max length of article description is 500 characters."),
	]),
});

type ArticleForm = Input<typeof ArticleSchema>;

const ArticleSubmit: Component<{ setSubmitVis: Setter<boolean> }> = (props) => {
	const utils = trpc.useContext();
	const articleMut = trpc.postArticle.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));
	const [articleForm, { Form, Field }] = createForm<ArticleForm>({
		validate: valiForm(ArticleSchema),
	});
	const handleSubmit: SubmitHandler<ArticleForm> = async (values, event) => {
		articleMut.mutateAsync(values);
	};

	return (
		<div>
			<Show
				when={!articleMut.isSuccess}
				fallback={
					<div class="relative flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl ">
						<h2 class="text-lg font-bold">
							Your article was submitted for review!
						</h2>
						<CustomButton
							onClick={() => {
								articleMut.reset();
							}}
						>
							Submit another one
						</CustomButton>
					</div>
				}
			>
				<Form onSubmit={handleSubmit}>
					<div class="m-4 flex flex-col items-center justify-center gap-4">
						<h3 class="text-lg underline underline-offset-4">
							Link to article:
						</h3>
						<Field name="link">
							{(field, props) => (
								<>
									<textarea
										class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
										{...props}
										cols={60}
										rows={3}
										required
										autocomplete="off"
										placeholder="link"
									/>
									{field.error && <div>{field.error}</div>}
								</>
							)}
						</Field>
						<h3 class="text-lg underline underline-offset-4">
							Short description of article:
						</h3>
						<Field name="description">
							{(field, props) => (
								<>
									<textarea
										class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
										{...props}
										cols={60}
										rows={9}
										required
										autocomplete="off"
										placeholder="description"
									/>
									{field.error && <div>{field.error}</div>}
								</>
							)}
						</Field>
						<CustomButton type="submit">Submit</CustomButton>
					</div>
				</Form>
			</Show>
		</div>
	);
};

export default ArticleSubmit;
