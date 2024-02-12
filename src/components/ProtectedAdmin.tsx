import { cache, createAsync, redirect } from "@solidjs/router";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { auth } from "~/auth/lucia";

const getSession = cache(async () => {
  "use server";
  const request = getRequestEvent()?.request;
  if (!request) {
    return redirect("/");
  }
  const authRequest = auth.handleRequest(request);
  const session = await authRequest.validate();
  const user = await auth.getUser(session?.user.userId);
  if (session && user.role === "admin") {
    return session.user.username;
  } else {
    return redirect("/");
  }
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
