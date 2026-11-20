import { For, Show, createSignal } from "solid-js";
import CustomButton from "~/components/CustomButton";
import { withProviders } from "~/islands/withProviders";
import { trpc } from "~/utils/trpc";

const deleteClass = "bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600";

/**
 * For people who can't sign in any more (lost their Discord account) and ask for their
 * data to be removed: they send a snippet of something they wrote, the admin searches for
 * it here and deletes the account with everything it submitted.
 */
const Page = () => {
	const [input, setInput] = createSignal("");
	const [query, setQuery] = createSignal("");
	const [confirm, setConfirm] = createSignal<string | null>(null);
	const [deleted, setDeleted] = createSignal<string | null>(null);

	const results = trpc.searchUsersByText.createQuery(
		() => ({ query: query() }),
		() => ({ enabled: query().length >= 4 }),
	);

	const utils = trpc.useContext();
	const deleteMut = trpc.deleteUserAdmin.createMutation(() => ({
		onSuccess: (_data, variables) => {
			setDeleted(variables.userId);
			setConfirm(null);
			utils.invalidate();
		},
	}));

	const search = (e: SubmitEvent) => {
		e.preventDefault();
		setDeleted(null);
		setConfirm(null);
		deleteMut.reset();
		setQuery(input().trim());
	};

	const date = (d: Date | string) => new Date(d).toLocaleDateString();

	return (
		<div class="flex min-h-screen w-full flex-col items-center gap-8 bg-slate-100 py-16">
			<div class="flex w-11/12 max-w-2xl flex-col gap-6 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-10 shadow-xl lg:p-12">
				<h1 class="text-center font-bold text-2xl lg:text-3xl">Find and delete an account</h1>
				<p class="text-slate-700">
					Paste a piece of text the person says they wrote (a poll answer or an article description or
					link). Every account with matching text is listed, with what it has submitted. Deleting an
					account removes it and all of its data, and can't be undone.
				</p>
				<form class="flex flex-col gap-3 sm:flex-row" onSubmit={search}>
					<input
						class="flex-1 rounded-lg border border-slate-600 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						value={input()}
						onInput={(e) => setInput(e.currentTarget.value)}
						placeholder="At least 4 characters of their text"
						minLength={4}
						maxLength={200}
						required
					/>
					<CustomButton type="submit" class="m-0">
						Search
					</CustomButton>
				</form>
			</div>

			<Show when={deleted()}>
				<p class="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-800">
					Account and all its data deleted.
				</p>
			</Show>
			<Show when={deleteMut.isError}>
				<p class="rounded-full bg-red-100 px-4 py-2 font-semibold text-red-800">
					{deleteMut.error?.message ?? "Couldn't delete the account."}
				</p>
			</Show>

			<Show when={query() && results.isFetching}>
				<p>Searching…</p>
			</Show>
			<Show when={query() && results.data && results.data.length === 0 && !results.isFetching}>
				<p>No account has written that text.</p>
			</Show>

			<For each={results.data}>
				{(user) => (
					<div class="flex w-11/12 max-w-2xl flex-col gap-4 rounded-3xl bg-white px-4 py-8 shadow-md lg:p-10">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<h2 class="font-bold text-lg">
								Account <span class="font-mono text-base">{user.id}</span>
							</h2>
							<span class="text-slate-600 text-sm">{`Joined ${date(user.joined)}`}</span>
						</div>
						<p class="text-slate-700">
							{`Has: ${user.counts.personal} personal poll, ${user.counts.their} other poll, ${user.counts.articles} article(s)`}
						</p>
						<For each={user.matches}>
							{(match) => (
								<div class="rounded-xl border border-slate-300 p-4">
									<p class="text-slate-600 text-sm">
										{`${match.source} · ${match.column} · ${date(match.submittedAt)} · ${
											match.accepted === true ? "accepted" : match.accepted === false ? "declined" : "pending"
										}`}
									</p>
									<p class="mt-2 whitespace-pre-line">{match.excerpt}</p>
								</div>
							)}
						</For>
						<Show
							when={!user.isAdmin}
							fallback={<p class="text-slate-600 italic">Admin account — can't be deleted here.</p>}
						>
							<Show
								when={confirm() === user.id}
								fallback={
									<CustomButton class={`self-center ${deleteClass}`} onClick={() => setConfirm(user.id)}>
										Delete account and all data
									</CustomButton>
								}
							>
								<div class="flex flex-col items-center gap-2">
									<p class="text-center font-semibold text-red-700">
										Delete this account and everything it submitted? This can't be undone.
									</p>
									<div class="flex flex-wrap justify-center">
										<CustomButton
											class="bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-700"
											disabled={deleteMut.isPending}
											onClick={() => deleteMut.mutate({ userId: user.id })}
										>
											Yes, delete
										</CustomButton>
										<CustomButton onClick={() => setConfirm(null)}>Cancel</CustomButton>
									</div>
								</div>
							</Show>
						</Show>
					</div>
				)}
			</For>
		</div>
	);
};

export default withProviders(Page);
