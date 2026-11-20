import { Field, Form, type SubmitHandler, createForm, reset } from "@formisch/solid";
import { For, Show, createSignal } from "solid-js";
import * as v from "valibot";
import AdminShell, { AdminCard } from "~/components/AdminShell";
import CustomButton from "~/components/CustomButton";
import Segmented from "~/components/Segmented";
import { withProviders } from "~/islands/withProviders";
import { trpc } from "~/utils/trpc";

const declineSchema = v.object({
	decline_reason: v.pipe(
		v.string(),
		v.trim(),
		v.maxLength(600, "Your text is too long! (Max. 600 characters)"),
		v.minLength(10, "Your text is too short, 10 chars"),
	),
});

type Tab = "poll" | "articles";
type Poll = "Personal_questions" | "Their_questions";
type Status = "pending" | "published" | "declined";
const statusValue: Record<Status, boolean | null> = { pending: null, published: true, declined: false };
const PER_PAGE = 25;

const green = "bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-700";
const amber = "bg-amber-500 hover:bg-amber-600 focus:bg-amber-600 active:bg-amber-600";
const red = "bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600";

/** "what_others_should_know" → "What others should know" */
const label = (key: string) => key.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());

/** The written answers of an entry, skipping empty ones and the internal id/count. */
const Fields = (props: { entry: Record<string, unknown> }) => (
	<dl class="flex flex-col gap-3">
		<For each={Object.keys(props.entry).filter((k) => k !== "id" && k !== "count" && props.entry[k] != null && props.entry[k] !== "")}>
			{(key) => (
				<div>
					<dt class="font-semibold text-slate-500 text-sm">{label(key)}</dt>
					<dd class="whitespace-pre-line break-words">{String(props.entry[key])}</dd>
				</div>
			)}
		</For>
	</dl>
);

const Pager = (props: { page: number; total: number; setPage: (p: number) => void }) => {
	const pages = () => Math.max(1, Math.ceil(props.total / PER_PAGE));
	return (
		<Show when={pages() > 1}>
			<div class="flex items-center justify-center gap-4">
				<CustomButton disabled={props.page === 0} class="disabled:opacity-40" onClick={() => props.setPage(props.page - 1)}>
					Back
				</CustomButton>
				<span class="font-semibold">{`Page ${props.page + 1} / ${pages()}`}</span>
				<CustomButton
					disabled={props.page + 1 >= pages()}
					class="disabled:opacity-40"
					onClick={() => props.setPage(props.page + 1)}
				>
					Next
				</CustomButton>
			</div>
		</Show>
	);
};

const Page = () => {
	// The admin bell links here with ?tab=articles or ?pOrT=Their_questions
	const initial = new URLSearchParams(location.search);
	const [tab, setTab] = createSignal<Tab>(initial.get("tab") === "articles" ? "articles" : "poll");
	const [pOrT, setPOrT] = createSignal<Poll>(
		initial.get("pOrT") === "Their_questions" ? "Their_questions" : "Personal_questions",
	);
	const [status, setStatus] = createSignal<Status>("pending");
	const [page, setPage] = createSignal(0);
	const [declining, setDeclining] = createSignal<number | null>(null);
	const [confirmDelete, setConfirmDelete] = createSignal<number | null>(null);

	const resetView = () => {
		setPage(0);
		setDeclining(null);
		setConfirmDelete(null);
	};

	const utils = trpc.useContext();
	const refresh = () => {
		utils.listSubmissions.invalidate();
		utils.listArticles.invalidate();
		utils.pendingCounts.invalidate();
	};

	// Pending counts for the red badges on the filters (same query as the admin bell)
	const pending = trpc.pendingCounts.createQuery(undefined, () => ({ placeholderData: (prev) => prev }));
	const pendingFor = (t: Tab, poll: Poll) =>
		t === "articles"
			? (pending.data?.articles ?? 0)
			: poll === "Their_questions"
				? (pending.data?.their ?? 0)
				: (pending.data?.personal ?? 0);

	const submissions = trpc.listSubmissions.createQuery(
		() => ({ page: page(), accepted: statusValue[status()], pOrT: pOrT() }),
		() => ({ enabled: tab() === "poll", placeholderData: (prev) => prev }),
	);
	const articles = trpc.listArticles.createQuery(
		() => ({ page: page(), accepted: statusValue[status()] }),
		() => ({ enabled: tab() === "articles", placeholderData: (prev) => prev }),
	);

	const acceptMut = trpc.acceptSubmission.createMutation(() => ({ onSuccess: refresh }));
	const acceptArticleMut = trpc.acceptArticle.createMutation(() => ({ onSuccess: refresh }));
	const declineMut = trpc.declineSubmission.createMutation(() => ({ onSuccess: () => doneDeclining() }));
	const declineArticleMut = trpc.declineArticle.createMutation(() => ({ onSuccess: () => doneDeclining() }));
	const deleteArticleMut = trpc.deleteArticleAdmin.createMutation(() => ({
		onSuccess: () => {
			setConfirmDelete(null);
			refresh();
		},
	}));

	const declineForm = createForm({ schema: declineSchema });
	const doneDeclining = () => {
		setDeclining(null);
		reset(declineForm);
		refresh();
	};
	const handleDecline: SubmitHandler<typeof declineSchema> = (values) => {
		const id = declining();
		if (id === null) return;
		if (tab() === "poll") declineMut.mutate({ id, pOrT: pOrT(), decline_reason: values.decline_reason });
		else declineArticleMut.mutate({ id, decline_reason: values.decline_reason });
	};

	const entries = () =>
		(tab() === "poll" ? submissions.data?.poll : articles.data) as Record<string, unknown>[] | undefined;
	const total = () =>
		tab() === "poll" ? (submissions.data?.total ?? 0) : Number(articles.data?.[0]?.count ?? 0);
	const busy = () =>
		acceptMut.isPending || acceptArticleMut.isPending || declineMut.isPending || declineArticleMut.isPending;

	const accept = (id: number) =>
		tab() === "poll" ? acceptMut.mutate({ id, pOrT: pOrT() }) : acceptArticleMut.mutate({ id });

	return (
		<AdminShell title="Review submissions" description="New poll answers and articles stay hidden until accepted.">
			<AdminCard>
				<div class="flex flex-wrap items-center gap-x-6 gap-y-4 pt-1">
					<Segmented
						label="What to review"
						options={[
							["poll", "Polls"],
							["articles", "Articles"],
						]}
						value={tab()}
						badges={{
							poll: (pending.data?.personal ?? 0) + (pending.data?.their ?? 0),
							articles: pending.data?.articles ?? 0,
						}}
						onChange={(v) => {
							setTab(v);
							resetView();
						}}
					/>
					<Show when={tab() === "poll"}>
						<Segmented
							label="Poll"
							options={[
								["Personal_questions", "Personal"],
								["Their_questions", "Other"],
							]}
							value={pOrT()}
							badges={{
								Personal_questions: pending.data?.personal ?? 0,
								Their_questions: pending.data?.their ?? 0,
							}}
							onChange={(v) => {
								setPOrT(v);
								resetView();
							}}
						/>
					</Show>
					<Segmented
						label="Status"
						options={[
							["pending", "Pending"],
							["published", "Published"],
							["declined", "Declined"],
						]}
						value={status()}
						badges={{ pending: pendingFor(tab(), pOrT()) }}
						onChange={(v) => {
							setStatus(v);
							resetView();
						}}
					/>
					<span class="ml-auto text-slate-600">{`${total()} ${total() === 1 ? "entry" : "entries"}`}</span>
				</div>
			</AdminCard>

			<Show when={entries()?.length === 0}>
				<p class="py-10 text-center text-slate-500">Nothing here.</p>
			</Show>

			<For each={entries()}>
				{(entry, index) => {
					const id = entry.id as number;
					return (
						<AdminCard>
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-semibold text-slate-500">{`#${page() * PER_PAGE + index() + 1} · id ${id}`}</span>
								<div class="ml-auto flex flex-wrap">
									<Show when={status() !== "published"}>
										<CustomButton class={green} disabled={busy()} onClick={() => accept(id)}>
											Accept
										</CustomButton>
									</Show>
									<Show when={status() !== "declined"}>
										<CustomButton class={amber} onClick={() => setDeclining(declining() === id ? null : id)}>
											Decline
										</CustomButton>
									</Show>
									<Show when={tab() === "articles"}>
										<CustomButton class={red} onClick={() => setConfirmDelete(confirmDelete() === id ? null : id)}>
											Delete
										</CustomButton>
									</Show>
								</div>
							</div>

							<Show when={declining() === id}>
								<Form of={declineForm} onSubmit={handleDecline} class="w-full">
									<div class="flex flex-col gap-2 rounded-xl bg-amber-50 p-4">
										<Field of={declineForm} path={["decline_reason"]}>
											{(field) => (
												<>
													<label class="font-semibold" for={`reason-${id}`}>
														Reason, shown to the author
													</label>
													<textarea
														id={`reason-${id}`}
														class="w-full resize-y rounded-lg border border-slate-400 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
														{...field.props}
														value={field.input ?? ""}
														rows={3}
														autocomplete="off"
													/>
													{field.errors && <p class="text-red-600 text-sm">{field.errors[0]}</p>}
												</>
											)}
										</Field>
										<div class="flex flex-wrap">
											<CustomButton type="submit" class={amber} disabled={busy()}>
												Decline
											</CustomButton>
											<CustomButton
												onClick={() => {
													setDeclining(null);
													reset(declineForm);
												}}
											>
												Cancel
											</CustomButton>
										</div>
									</div>
								</Form>
							</Show>

							<Show when={confirmDelete() === id}>
								<div class="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-4">
									<p class="font-semibold text-red-700">Delete this article permanently?</p>
									<div class="ml-auto flex">
										<CustomButton
											class="bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-700"
											disabled={deleteArticleMut.isPending}
											onClick={() => deleteArticleMut.mutate({ id })}
										>
											Yes, delete
										</CustomButton>
										<CustomButton onClick={() => setConfirmDelete(null)}>Cancel</CustomButton>
									</div>
								</div>
							</Show>

							<Fields entry={entry} />
						</AdminCard>
					);
				}}
			</For>

			<Pager
				page={page()}
				total={total()}
				setPage={(p) => {
					setPage(p);
					setDeclining(null);
					setConfirmDelete(null);
					window.scrollTo({ top: 0, behavior: "smooth" });
				}}
			/>
		</AdminShell>
	);
};

export default withProviders(Page);
