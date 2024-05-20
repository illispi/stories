import { cache, createAsync, redirect } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { validateSession } from "~/server/trpc/context";

const getSession = cache(async () => {
	"use server";

	//TODO only allow GET requests

	const { user } = await validateSession();

	if (user?.role === "admin") {
		return true;
	}
	return redirect("/");
}, "session");

export const route = {
	load: () => getSession(),
};

const ProtectedAdmin = (Comp: IProtectedComponent) => {
	return {
		route,
		Page: () => {
			const session = createAsync(() => getSession());
			return (
				<Show when={session()} keyed>
					{(sess) => <Comp  />}
				</Show>
			);
		},
	};
};

type IProtectedComponent = Component;

export default ProtectedAdmin;

//TODO test that user cant access admin
