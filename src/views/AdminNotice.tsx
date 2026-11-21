import { Show, createSignal } from "solid-js";
import AdminShell, { AdminCard } from "~/components/AdminShell";
import CustomButton from "~/components/CustomButton";
import { formatBackupDate } from "~/data/backupNotice";
import { withProviders } from "~/islands/withProviders";
import { trpc } from "~/utils/trpc";

const today = () => new Date().toISOString().slice(0, 10);

/** Admin: post or remove the site-wide "backup restored" notice. */
const Page = () => {
	const utils = trpc.useContext();
	const notice = trpc.siteNotice.createQuery();
	const [date, setDate] = createSignal("");
	const [confirmRemove, setConfirmRemove] = createSignal(false);
	const done = () => {
		utils.siteNotice.invalidate();
		setConfirmRemove(false);
	};
	const setMut = trpc.setBackupNotice.createMutation(() => ({ onSuccess: done }));
	const clearMut = trpc.clearBackupNotice.createMutation(() => ({ onSuccess: done }));
	const error = () => {
		const message = setMut.error?.message;
		if (!message) return null;
		try {
			return (JSON.parse(message) as { message: string }[])[0]?.message ?? message;
		} catch {
			return message;
		}
	};

	return (
		<AdminShell
			title="Site notice"
			description="After restoring a database backup, tell users: anything they deleted after the backup may be back, so they should sign in and delete it again."
		>
			<AdminCard>
				<h2 class="font-bold text-xl">Current notice</h2>
				<Show when={notice.data} fallback={<p class="text-slate-600">No notice is shown.</p>}>
					{(n) => (
						<>
							<div class="rounded-xl bg-amber-100 px-4 py-2 text-amber-950 text-sm ring-1 ring-amber-300">
								We restored a backup from <strong>{formatBackupDate(n().backupDate)}</strong>. If you deleted
								anything after that, it may be back. <span class="font-semibold underline">What to do</span>
							</div>
							<p class="text-slate-600 text-sm">
								Shown under the header on every page since {new Date(n().postedAt).toLocaleString()}. It links to{" "}
								<a class="font-semibold text-blue-800 underline" href="/backup-restored">
									/backup-restored
								</a>
								.
							</p>
							<Show
								when={confirmRemove()}
								fallback={
									<CustomButton
										class="m-0 self-start bg-slate-500 hover:bg-slate-600 focus:bg-slate-600 active:bg-slate-600"
										onClick={() => setConfirmRemove(true)}
									>
										Remove notice
									</CustomButton>
								}
							>
								<div class="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
									<p class="font-semibold">Stop showing the notice to everyone?</p>
									<CustomButton
										class="m-0 bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600"
										disabled={clearMut.isPending}
										onClick={() => clearMut.mutate()}
									>
										Remove
									</CustomButton>
									<CustomButton class="m-0" onClick={() => setConfirmRemove(false)}>
										Cancel
									</CustomButton>
								</div>
							</Show>
						</>
					)}
				</Show>
			</AdminCard>

			<AdminCard>
				<h2 class="font-bold text-xl">{notice.data ? "Update the notice" : "Post a notice"}</h2>
				<form
					class="flex flex-wrap items-end gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						setMut.mutate({ backupDate: date() });
					}}
				>
					<label class="flex flex-col gap-1">
						<span class="font-semibold text-slate-600 text-sm">Date the restored backup was taken</span>
						<input
							type="date"
							required
							max={today()}
							value={date()}
							onInput={(e) => setDate(e.currentTarget.value)}
							class="rounded-xl border border-slate-300 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
						/>
					</label>
					<CustomButton type="submit" class="m-0" disabled={setMut.isPending || !date()}>
						{notice.data ? "Update notice" : "Show notice"}
					</CustomButton>
				</form>
				<Show when={error()}>
					<p class="text-red-600">{error()}</p>
				</Show>
				<p class="text-slate-600 text-sm">
					Posting or updating shows the notice again to people who dismissed an earlier one.
				</p>
			</AdminCard>
		</AdminShell>
	);
};

export default withProviders(Page);
