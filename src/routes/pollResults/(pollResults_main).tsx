import { route } from "routes-gen";
import { Suspense, type Component } from "solid-js";
import InfoBox from "~/components/InfoBox";

const PollResults: Component = () => (
	<Suspense>
		<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">
				Poll results
			</h1>
			<div class="mb-16 flex h-full w-11/12 max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
				<InfoBox
					header="Personal experiences with schizophrenia"
					link="Personal poll results"
					text="See various stats from the poll conducted by people who have psychosis related illness"
					route={route("/pollResults/:pOrT/:fOrT/pollResults", {
						pOrT: "Personal_questions",
						fOrT: "real",
					})}
				/>
				<div class="flex items-center justify-center">
					<h2 class="rounded-full border-2 border-fuchsia-500 p-12 text-4xl">
						OR
					</h2>
				</div>
				<InfoBox
					header="Experiences of relatives or someone familiar with schizophrenia"
					link="Relative poll results"
					text="See results from different poll filled by relatives, friends, or even someone familiar with people with schizophrenia"
					route={route("/pollResults/:pOrT/:fOrT/pollResults", {
						pOrT: "Their_questions",
						fOrT: "real",
					})}
				/>
			</div>
		</div>
	</Suspense>
);

export default PollResults;
