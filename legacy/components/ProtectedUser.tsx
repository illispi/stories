import { cache, createAsync, redirect } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { userLoader } from "~/server/loader/userLoader";

const getUser = cache(async () => {
	return await userLoader();
}, "user");

export const route = {
	load: () => getUser(),
};

const ProtectedUser = (Comp: IProtectedComponent) => {
	return {
		route,
		Page: () => {
			const session = createAsync(() => getUser());
			return (
				<Show when={session()} keyed>
					{(sess) => <Comp />}
				</Show>
			);
		},
	};
};

type IProtectedComponent = Component;

export default ProtectedUser;
