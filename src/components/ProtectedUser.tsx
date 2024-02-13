import { cache, createAsync, redirect } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { eden } from "~/app";
import { handleEden } from "~/utils/handleEden";
import { serverFetch } from "~/utils/serverFetch";

const getSession = cache(async () => {
  "use server";

  const authQuery = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () =>
      handleEden(await serverFetch(eden.api.auth.status.get)),
  }));

  if (authQuery.data?.role && authQuery.data.role === "user") {
    return authQuery.data.username;
  } else {
    return redirect("/");
  }
}, "session");

export const route = {
  load: () => getSession(),
};

const ProtectedUser = (Comp: IProtectedComponent) => {
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

export default ProtectedUser;
