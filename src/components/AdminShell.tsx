import { For, type ParentComponent, Show } from "solid-js";
import { A, useLocation } from "~/utils/router";

const LINKS = [
	{ href: "/admin/", label: "Overview" },
	{ href: "/admin/adminCrud", label: "Review" },
	{ href: "/admin/users", label: "Accounts" },
	{ href: "/admin/fake", label: "Fake data" },
	{ href: "/admin/sentry", label: "Sentry test" },
] as const;

const normalise = (path: string) => path.replace(/\/+$/, "") || "/";

/** Shared frame for the admin pages: section nav, title and a centred content column. */
const AdminShell: ParentComponent<{ title: string; description?: string }> = (props) => {
	const location = useLocation();
	const active = (href: string) => normalise(location.pathname) === normalise(href);

	return (
		<div class="min-h-screen w-full bg-slate-100 pb-20">
			<nav class="border-slate-200 border-b bg-white" aria-label="Admin sections">
				<div class="mx-auto flex w-11/12 max-w-5xl flex-wrap gap-1 py-3">
					<For each={LINKS}>
						{(link) => (
							<A
								href={link.href}
								aria-current={active(link.href) ? "page" : undefined}
								class="rounded-full px-4 py-1.5 font-semibold text-sm transition-colors duration-200"
								classList={{
									"bg-blue-800 text-white": active(link.href),
									"text-slate-700 hover:bg-slate-100": !active(link.href),
								}}
							>
								{link.label}
							</A>
						)}
					</For>
				</div>
			</nav>
			<div class="mx-auto flex w-11/12 max-w-5xl flex-col gap-6 pt-10">
				<header class="flex flex-col gap-1">
					<p class="font-semibold text-fuchsia-700 text-sm uppercase tracking-wide">Admin</p>
					<h1 class="font-bold text-3xl lg:text-4xl">{props.title}</h1>
					<Show when={props.description}>
						<p class="max-w-2xl text-slate-600">{props.description}</p>
					</Show>
				</header>
				{props.children}
			</div>
		</div>
	);
};

export default AdminShell;

/** White panel used inside admin pages. */
export const AdminCard: ParentComponent<{ class?: string }> = (props) => (
	<section class={`flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${props.class ?? ""}`}>
		{props.children}
	</section>
);
