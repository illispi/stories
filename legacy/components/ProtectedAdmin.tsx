import { cache, createAsync, redirect } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { userLoader } from "~/server/loader/userLoader";
import { validateSession } from "~/server/trpc/context";

const getUser = cache(async () => {
	return await userLoader();
}, "user");

export const route = {
	load: () => getUser(),
};

const ProtectedAdmin = (Comp: IProtectedComponent) => {
	return {
		route,
		Page: () => {
			const session = createAsync(() => getUser());
			return (
				<Show when={session()?.role === "admin"} keyed>
					{(sess) => <Comp />}
				</Show>
			);
		},
	};
};

type IProtectedComponent = Component;

export default ProtectedAdmin;

//TODO test that user cant access admin
