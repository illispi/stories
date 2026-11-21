import { Show, createSignal } from "solid-js";
import { formatBackupDate } from "~/data/backupNotice";
import { A } from "~/utils/router";
import { trpc } from "~/utils/trpc";

const dismissKey = (postedAt: string) => `backup_notice_dismissed_${postedAt}`;
const wasDismissed = (postedAt: string) => {
	try {
		return localStorage.getItem(dismissKey(postedAt)) === "1";
	} catch {
		return false;
	}
};

/**
 * Shown under the header while an admin has posted a "backup restored" notice. Can be
 * dismissed (remembered in this browser); a newly posted notice shows again.
 */
export default function BackupNoticeBanner() {
	const notice = trpc.siteNotice.createQuery(undefined, () => ({ staleTime: 5 * 60_000 }));
	const [dismissed, setDismissed] = createSignal<string | null>(null);
	const visible = () => {
		const n = notice.data;
		return n && dismissed() !== n.postedAt && !wasDismissed(n.postedAt) ? n : null;
	};

	return (
		<Show when={visible()}>
			{(n) => (
				<div
					role="status"
					class="flex w-full items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-amber-950 text-sm ring-1 ring-amber-300"
				>
					<p class="text-center">
						We restored a backup from <strong>{formatBackupDate(n().backupDate)}</strong>. If you deleted anything
						after that, it may be back.{" "}
						<A href="/backup-restored" class="font-semibold underline underline-offset-2">
							What to do
						</A>
					</p>
					<button
						type="button"
						aria-label="Dismiss notice"
						class="rounded-full px-2 text-lg leading-none hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
						onClick={() => {
							try {
								localStorage.setItem(dismissKey(n().postedAt), "1");
							} catch {
								// storage unavailable: hide for this page view only
							}
							setDismissed(n().postedAt);
						}}
					>
						×
					</button>
				</div>
			)}
		</Show>
	);
}
