import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { auth } from "~/auth/lucia";

const ProtectedUser = (Comp: IProtectedComponent) => {
  const routeData = () => {
    return createServerData$(async (_, event) => {
      const authRequest = auth.handleRequest(event.request);
      const session = await authRequest.validate();
      if (session) {
        return session;
      } else {
        return redirect("/");
      }
    });
  };

  return {
    routeData,
    Page: () => {
      const session = useRouteData<typeof routeData>();
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
