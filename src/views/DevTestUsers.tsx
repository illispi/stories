import { For, Show, createResource, createSignal } from "solid-js";
import { AdminCard } from "~/components/AdminShell";
import CustomButton from "~/components/CustomButton";
import { authClient } from "~/utils/auth-client";

type State = {
	current: { id: string; isTest: boolean };
	testUsers: { id: string; created_at: string }[];
};

const api = async (body?: Record<string, unknown>) => {
	const res = await fetch("/api/dev/test-users", {
		method: body ? "POST" : "GET",
		headers: body ? { "content-type": "application/json" } : undefined,
		body: body ? JSON.stringify(body) : undefined,
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
	return data;
};

/**
 * Development only. Create test accounts and switch between them, to test things that need
 * more than one user. Test accounts are ordinary users with a made-up email
 * (test_…@test.invalid) and no Discord link.
 */
const DevTestUsers = () => {
	const [state, { refetch }] = createResource<State>(() => api());
	const [busy, setBusy] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [confirmDelete, setConfirmDelete] = createSignal<string | null>(null);

	const run = async (body: Record<string, unknown>, reload: boolean) => {
		setBusy(true);
		setError(null);
		try {
			await api(body);
			// Full reload: the navbar, bells and every island pick up the new account
			if (reload) location.reload();
			else {
				setConfirmDelete(null);
				refetch();
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(false);
		}
	};

	const backToDiscord = async () => {
		setBusy(true);
		await authClient.signOut();
		await authClient.signIn.social({ provider: "discord", callbackURL: "/dev/test-users" });
	};

	return (
		<div class="min-h-screen w-full bg-slate-100 pb-20">
			<div class="mx-auto flex w-11/12 max-w-3xl flex-col gap-6 pt-10">
				<header class="flex flex-col gap-1">
					<p class="font-semibold text-amber-700 text-sm uppercase tracking-wide">Development only</p>
					<h1 class="font-bold text-3xl lg:text-4xl">Test users</h1>
					<p class="text-slate-600">
						Sign in as made-up accounts to test things that need more than one user. They're ordinary
						users (not admins) with no Discord link. This page and its API don't exist in production
						builds.
					</p>
				</header>

				<Show when={error()}>
					<p class="rounded-xl bg-red-50 p-4 text-red-700">{error()}</p>
				</Show>

				<Show
					when={state()}
					fallback={
						<Show when={state.error} fallback={<p>Loading…</p>}>
							<p class="rounded-xl bg-red-50 p-4 text-red-700">{String(state.error?.message)}</p>
						</Show>
					}
				>
					{(s) => (
						<>
							<AdminCard>
								<p>
									Signed in as{" "}
									<span class="font-mono text-sm">{s().current.id}</span>{" "}
									<span
										class="rounded-full px-2 py-0.5 font-semibold text-xs"
										classList={{
											"bg-amber-100 text-amber-800": s().current.isTest,
											"bg-blue-100 text-blue-800": !s().current.isTest,
										}}
									>
										{s().current.isTest ? "test account" : "your account"}
									</span>
								</p>
								<div class="flex flex-wrap">
									<CustomButton disabled={busy()} onClick={() => run({ action: "create" }, true)}>
										Create a test user and sign in as them
									</CustomButton>
									<Show when={s().current.isTest}>
										<CustomButton disabled={busy()} onClick={backToDiscord}>
											Back to my Discord account
										</CustomButton>
									</Show>
								</div>
							</AdminCard>

							<AdminCard>
								<h2 class="font-semibold text-xl">{`Test accounts (${s().testUsers.length})`}</h2>
								<Show when={s().testUsers.length === 0}>
									<p class="text-slate-500">None yet.</p>
								</Show>
								<ul class="flex flex-col divide-y divide-slate-200">
									<For each={s().testUsers}>
										{(u, i) => (
											<li class="flex flex-wrap items-center gap-2 py-2">
												<span class="font-semibold">{`Test user ${i() + 1}`}</span>
												<span class="font-mono text-slate-500 text-xs">{u.id}</span>
												<Show when={u.id === s().current.id}>
													<span class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800 text-xs">
														signed in
													</span>
												</Show>
												<div class="ml-auto flex flex-wrap">
													<Show when={u.id !== s().current.id}>
														<CustomButton
															disabled={busy()}
															class="px-3 py-1.5 text-sm"
															onClick={() => run({ action: "login", userId: u.id }, true)}
														>
															Sign in as
														</CustomButton>
													</Show>
													<Show
														when={confirmDelete() === u.id}
														fallback={
															<CustomButton
																class="bg-red-500 px-3 py-1.5 text-sm hover:bg-red-600 focus:bg-red-600"
																onClick={() => setConfirmDelete(u.id)}
															>
																Delete
															</CustomButton>
														}
													>
														<CustomButton
															disabled={busy()}
															class="bg-red-600 px-3 py-1.5 text-sm hover:bg-red-700 focus:bg-red-700"
															onClick={() => run({ action: "delete", userId: u.id }, u.id === s().current.id)}
														>
															Yes, delete with all data
														</CustomButton>
														<CustomButton class="px-3 py-1.5 text-sm" onClick={() => setConfirmDelete(null)}>
															Cancel
														</CustomButton>
													</Show>
												</div>
											</li>
										)}
									</For>
								</ul>
							</AdminCard>
						</>
					)}
				</Show>
			</div>
		</div>
	);
};

export default DevTestUsers;
