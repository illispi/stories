import { cache, createAsync, redirect } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { eden } from "~/app";
import { db } from "~/server/db";
import { validateSession } from "~/server/trpc/context";
import { handleEden } from "~/utils/handleEden";
import { serverFetch } from "~/utils/serverFetch";

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
			const session = createAsync(getSession);
			return (
				<Show when={session()} keyed>
					{(sess) => <Comp {...sess} />}
				</Show>
			);
		},
	};
};

type IProtectedComponent = Component;

export default ProtectedAdmin;

//TODO test that user cant access admin
