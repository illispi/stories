import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { auth } from "~/auth/lucia";

const ProtectedAdmin = (Comp: IProtectedComponent) => {
  const routeData = () => {
    return createServerData$(async (_, event) => {
      const authRequest = auth.handleRequest(event.request);
      const session = await authRequest.validate();
      const user = await auth.getUser(session?.user.userId);
      if (session && user.role === "admin") {
        return session.user.username;
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

export default ProtectedAdmin;

//TODO test that user cant access admin
