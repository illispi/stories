import { For, Show, createSignal } from "solid-js";
import { isSensitive, LS_POLL, PREFER_NOT_LABEL } from "~/data/sensitiveQuestions";
import CustomButton from "~/components/CustomButton";
import { ESTIMATED_MINUTES } from "~/data/pollInfo";

type Q = {
	question?: string;
	questionType: string;
	questionDB?: string;
	selections?: string[];
	multiSelect?: [string, string][];
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** How a question is answered, for the read-only preview. */
const answerKinds = (poll: "personalQuestions" | "theirQuestions", q: Q): string[] => {
	const extra = q.questionDB && isSensitive(LS_POLL[poll], q.questionDB) ? [PREFER_NOT_LABEL] : [];
	switch (q.questionType) {
		case "yesOrNo":
			return ["Yes", "No", ...extra];
		case "unknown":
			return ["Yes", "No", "Unknown", ...extra];
		case "selection":
			return (q.selections ?? []).map(capitalize);
		case "multiSelect":
			return [...(q.multiSelect ?? []).map(([, label]) => label), "(pick any)"];
		case "integer":
			return [q.questionDB === "weight_amount" ? "Number (kg or lb)" : "Number"];
		case "text":
			return ["Written answer"];
		default:
			return [];
	}
};


/** Shown before the first question: what to expect and how answers are used. */
export default function PollIntro(props: {
	poll: "personalQuestions" | "theirQuestions";
	questions: Q[];
	signedIn: boolean;
	onStart: () => void;
}) {
	const count = () => props.questions.filter((q) => q.questionType !== "submit").length;
	const [showPreview, setShowPreview] = createSignal(false);
	const personal = () => props.poll === "personalQuestions";
	const points = () => [
		"Anonymous: no name, email or username is stored. Only your Discord account ID is kept, so you can edit or delete your answers later.",
		"Answers are reviewed before they appear in the results. Written answers may be shown publicly, so leave out names or details that could identify anyone.",
		'Sensitive questions have a "Prefer not to say" option, and many questions are skipped based on earlier answers.',
		props.signedIn
			? "Your progress is saved to your account as you go, so you can continue on another device."
			: "You sign in with Discord before starting, so your progress is saved to your account as you go.",
		"You can see, edit or delete everything you've submitted at any time in Your data.",
		...(personal() ? [] : ["Know more than one person with schizophrenia? You can answer once for each of them."]),
	];

	return (
		<div class="flex min-h-screen w-full items-start justify-center px-4 pt-24 pb-16 lg:items-center lg:pt-16">
			<section class="flex w-full max-w-2xl flex-col gap-6 rounded-3xl border-fuchsia-600 border-t-4 bg-white p-6 shadow-xl lg:p-12">
				<h1 class="text-center font-bold text-2xl lg:text-4xl">
					{personal() ? "Your experience of schizophrenia" : "About someone you know with schizophrenia"}
				</h1>
				<div class="flex flex-wrap justify-center gap-3">
					<span class="rounded-full bg-blue-100 px-4 py-1.5 font-semibold text-blue-900">{count()} questions</span>
					<span class="rounded-full bg-blue-100 px-4 py-1.5 font-semibold text-blue-900">
						about {ESTIMATED_MINUTES[props.poll]} minutes
					</span>
				</div>
				<p class="text-center text-lg text-slate-700">
					{personal()
						? "Your answers help others understand what living with schizophrenia or schizoaffective disorder is really like."
						: "Your answers as a relative or friend show the illness from another side and help others who are in the same situation."}
				</p>
				<ul class="flex flex-col gap-3">
					<For each={points()}>
						{(point) => (
							<li class="flex gap-3">
								<span class="mt-1 text-fuchsia-600" aria-hidden="true">
									✓
								</span>
								<span>{point}</span>
							</li>
						)}
					</For>
				</ul>
				<Show when={personal()}>
					<p class="text-center text-slate-600 text-sm">
						If you're struggling right now, please reach out to someone you trust or your local crisis line.
					</p>
				</Show>
				<Show
					when={props.signedIn}
					fallback={
						<a
							href={`/login?redir=${encodeURIComponent(`/questionares/${props.poll}`)}`}
							class="mx-auto rounded-full bg-blue-500 px-8 py-3 text-center font-semibold text-lg text-white transition-all duration-200 ease-in hover:scale-110 hover:bg-blue-600 focus:bg-blue-600 active:scale-125"
						>
							Sign in to start
						</a>
					}
				>
					<CustomButton class="mx-auto w-56 text-lg" onClick={() => props.onStart()}>
						Start
					</CustomButton>
				</Show>
				<details
					class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
					open={showPreview()}
					onToggle={(e) => setShowPreview(e.currentTarget.open)}
				>
					<summary class="cursor-pointer text-center font-semibold">Preview the questions</summary>
					<ol class="mt-4 flex list-decimal flex-col gap-4 pl-6">
						<For each={props.questions.filter((q) => q.questionType !== "submit")}>
							{(q) => (
								<li>
									<p class="font-semibold">{q.question}</p>
									<div class="mt-1 flex flex-wrap gap-1.5">
										<For each={answerKinds(props.poll, q)}>
											{(kind) => (
												<span class="rounded-full bg-white px-2.5 py-0.5 text-slate-700 text-xs ring-1 ring-slate-200">
													{kind}
												</span>
											)}
										</For>
									</div>
								</li>
							)}
						</For>
					</ol>
					<p class="mt-4 text-center text-slate-600 text-sm">
						Some questions are only asked depending on earlier answers.
					</p>
				</details>
			</section>
		</div>
	);
}
