import { For, Show } from "solid-js";
import CustomButton from "~/components/CustomButton";

type Q = { questionType: string };

/** Rough time: a minute per written answer, ten seconds for the rest, rounded up to 5 minutes. */
export const estimateMinutes = (questions: Q[]) => {
	const asked = questions.filter((q) => q.questionType !== "submit");
	const seconds = asked.reduce((s, q) => s + (q.questionType === "text" ? 60 : 10), 0);
	return Math.max(5, Math.ceil(seconds / 60 / 5) * 5);
};

/** Shown before the first question: what to expect and how answers are used. */
export default function PollIntro(props: {
	poll: "personalQuestions" | "theirQuestions";
	questions: Q[];
	signedIn: boolean;
	onStart: () => void;
}) {
	const count = () => props.questions.filter((q) => q.questionType !== "submit").length;
	const personal = () => props.poll === "personalQuestions";
	const points = () => [
		"Anonymous: no name, email or username is stored. Only your Discord account ID is kept, so you can edit or delete your answers later.",
		"Answers are reviewed before they appear in the results. Written answers may be shown publicly, so leave out names or details that could identify anyone.",
		'Sensitive questions have a "Prefer not to say" option, and many questions are skipped based on earlier answers.',
		props.signedIn
			? "Your progress is saved to your account as you go, so you can continue on another device."
			: "Your progress is saved in this browser. Sign in to save it to your account and continue on another device.",
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
						about {estimateMinutes(props.questions)} minutes
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
				<CustomButton class="mx-auto w-56 text-lg" onClick={() => props.onStart()}>
					Start
				</CustomButton>
			</section>
		</div>
	);
}
