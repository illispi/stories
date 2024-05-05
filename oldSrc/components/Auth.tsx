import { Show, type VoidComponent } from "solid-js";
import {
  ServerError,
  createServerAction$,
  createServerData$,
} from "solid-start/server";
import CustomButton from "./CustomButton";
import { auth } from "~/auth/lucia";
import { A } from "solid-start";
import LoginA from "./LoginA";

const getSession = () => {
  return createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request);
    const session = await authRequest.validate();
    if (!session) {
      return null;
    }
    return session.user.username;
  });
};

const Auth: VoidComponent = () => {
  const sessionData = getSession();

  const [signOutStatus, signOut] = createServerAction$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request);
    const session = await authRequest.validate();
    if (!session) {
      throw new ServerError("Unauthorized", {
        status: 401,
      });
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
    <Show
      when={sessionData()}
      fallback={
       <LoginA/>
      }
    >
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
