import { For, Show } from "solid-js";
import AdminShell from "~/components/AdminShell";
import { withProviders } from "~/islands/withProviders";
import { A } from "~/utils/router";
import { trpc } from "~/utils/trpc";

const Page = () => {
	const pending = trpc.pendingCounts.createQuery(undefined, () => ({ placeholderData: (prev) => prev }));

	const sections = [
		{
			href: "/admin/adminCrud",
			title: "Review submissions",
			text: "Accept or decline poll answers and articles, and delete published articles.",
			badge: () => pending.data?.total,
		},
		{
			href: "/admin/users",
			title: "Find and delete an account",
			text: "Find an account from text its owner wrote, and delete it with all its data.",
		},
		{
			href: "/admin/fake",
			title: "Fake data",
			text: "Fill the fake-data tables used by the example results pages.",
		},
		{
			href: "/admin/sentry",
			title: "Test Sentry error reporting",
			text: "Trigger browser and server errors to check they reach Sentry.",
		},
	];

	return (
		<AdminShell title="Overview" description="Tools for running the site.">
			<Show when={pending.data}>
				{(counts) => (
					<div class="grid grid-cols-3 gap-3">
						<For
							each={[
								["Personal polls", counts().personal, "/admin/adminCrud"],
								["Other polls", counts().their, "/admin/adminCrud?pOrT=Their_questions"],
								["Articles", counts().articles, "/admin/adminCrud?tab=articles"],
							] as const}
						>
							{([label, n, href]) => (
								<A
									href={href}
									class="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
								>
									<span class="font-bold text-3xl" classList={{ "text-amber-600": n > 0, "text-slate-400": n === 0 }}>
										{n}
									</span>
									<span class="text-slate-600 text-sm">{`${label} waiting`}</span>
								</A>
							)}
						</For>
					</div>
				)}
			</Show>
			<div class="grid gap-4 sm:grid-cols-2">
				<For each={sections}>
					{(section) => (
						<A
							href={section.href}
							class="group flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
						>
							<span class="flex items-center gap-2 font-semibold text-lg">
								{section.title}
								<Show when={section.badge?.()}>
									{(n) => (
										<span class="rounded-full bg-red-600 px-2 text-sm text-white leading-6">{n()}</span>
									)}
								</Show>
								<span class="ml-auto text-slate-400 transition-transform group-hover:translate-x-1">→</span>
							</span>
							<span class="text-slate-600">{section.text}</span>
						</A>
					)}
				</For>
			</div>
		</AdminShell>
	);
};

export default withProviders(Page);
