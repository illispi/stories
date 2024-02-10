import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";
import { auth } from "~/auth/lucia";

import LoginA from "./LoginA";
import { action, cache, createAsync } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { createQuery } from "@tanstack/solid-query";

const Auth: VoidComponent = () => {
  const authQuery = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () => handleEden(await eden.api.auth.get()),
  }));

  const signOut = action(async () => {
    "use server";
    const request = getRequestEvent()?.request;
    if (!request) {
      return null;
    }
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();
    if (!session) {
      // throw new ServerError("Unauthorized", {
      //   status: 401,
      // });
      //TODO restore this
      return null;
    }
    await auth.invalidateSession(session.sessionId); // invalidate session
    const sessionCookie = auth.createSessionCookie(null);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  });

  return (
    <Show when={sessionData()} fallback={<LoginA />}>
      <CustomButton
        onClick={() => {
          signOut();
        }}
        class="w-44"
      >
        Sign out
      </CustomButton>
    </Show>
  );
};

export default Auth;
function handleEden(arg0: any): any {
  throw new Error("Function not implemented.");
}

