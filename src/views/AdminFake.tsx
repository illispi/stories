import { Show } from "solid-js";
import AdminShell, { AdminCard } from "~/components/AdminShell";
import CustomButton from "~/components/CustomButton";
import { withProviders } from "~/islands/withProviders";
import { trpc } from "~/utils/trpc";

const Page = () => {
	const fakeForFakeMut = trpc.fakeForFake.createMutation();
	const fakeForDevMut = trpc.fakeForDev.createMutation();
	const fakeArticlesForDevMut = trpc.fakeArticlesForDev.createMutation();

	const Status = (props: { done: boolean; error: boolean; pending: boolean }) => (
		<p class="text-sm" classList={{ "text-green-700": props.done, "text-red-600": props.error }}>
			{props.pending ? "Working…" : props.error ? "Failed." : props.done ? "Done." : ""}
		</p>
	);

	return (
		<AdminShell
			title="Fake data"
			description="The example results pages (…/fake/…) use separate fake tables, never real answers."
		>
			<AdminCard>
				<h2 class="font-semibold text-xl">Fake results pages</h2>
				<p class="text-slate-600">Adds generated answers to the fake tables.</p>
				<div class="flex flex-wrap">
					<CustomButton
						disabled={fakeForFakeMut.isPending}
						onClick={() => fakeForFakeMut.mutate({ pOrT: "Personal_questions_fake" })}
					>
						Add fake personal polls
					</CustomButton>
					<CustomButton
						disabled={fakeForFakeMut.isPending}
						onClick={() => fakeForFakeMut.mutate({ pOrT: "Their_questions_fake" })}
					>
						Add fake other polls
					</CustomButton>
				</div>
				<Status done={fakeForFakeMut.isSuccess} error={fakeForFakeMut.isError} pending={fakeForFakeMut.isPending} />
			</AdminCard>

			<Show
				when={import.meta.env.DEV}
				fallback={
					<p class="text-slate-500 text-sm">
						Development-only tools (fake submissions under your own account) are hidden in production.
					</p>
				}
			>
				<AdminCard>
					<h2 class="font-semibold text-xl">Development only</h2>
					<p class="text-slate-600">
						Creates real submissions under your own account, pending review, for testing the review
						and "Your data" pages.
					</p>
					<div class="flex flex-wrap">
						<CustomButton
							disabled={fakeArticlesForDevMut.isPending}
							onClick={() => fakeArticlesForDevMut.mutate()}
						>
							Add an article
						</CustomButton>
						<CustomButton
							disabled={fakeForDevMut.isPending}
							onClick={() => fakeForDevMut.mutate({ pOrT: "Personal_questions" })}
						>
							Add a personal poll
						</CustomButton>
						<CustomButton
							disabled={fakeForDevMut.isPending}
							onClick={() => fakeForDevMut.mutate({ pOrT: "Their_questions" })}
						>
							Add an other poll
						</CustomButton>
					</div>
					<Status
						done={fakeForDevMut.isSuccess || fakeArticlesForDevMut.isSuccess}
						error={fakeForDevMut.isError || fakeArticlesForDevMut.isError}
						pending={fakeForDevMut.isPending || fakeArticlesForDevMut.isPending}
					/>
					<Show when={fakeForDevMut.isError}>
						<p class="text-red-600 text-sm">{fakeForDevMut.error?.message}</p>
					</Show>
				</AdminCard>
			</Show>
		</AdminShell>
	);
};

export default withProviders(Page);
