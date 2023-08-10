import type { VoidComponent } from "solid-js";
import { createServerData$ } from "solid-start/server";
import CustomButton from "./CustomButton";
import { auth } from "~/auth/lucia";
import { A } from "solid-start";

const getSession = () => {
  return createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request);
    const session = await authRequest.validate();
    if (!session) {
      return null;
    }
    return session;
  });
};

const Auth: VoidComponent = () => {
  const sessionData = getSession();
  return (
    <CustomButton
      class="w-44"
    >
      <A href="/login">{sessionData() ? "Sign out" : "Sign in/up"}</A>
    </CustomButton>
  );
};

export default Auth;

//BUG maybe refesh page after sign out
