import type { VoidComponent } from "solid-js";
import { createServerData$ } from "solid-start/server";
import CustomButton from "./CustomButton";
import { auth } from "~/auth/lucia";

const createSession = () => {
  return createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request);
    const session = await authRequest.validate();
    if (!session) {
      return false;
    }
    return session.user;
  });
};

const Auth: VoidComponent = () => {
  const sessionData = createSession();
  return (
    <CustomButton
      class="w-44"
      // onClick={
      //   sessionData()
      //     ? () => void signOut({ redirectTo: "/", redirect: true })
      //     : () => void signIn()
      // }
    >
      {sessionData() ? "Sign out" : "Sign in/up"}
    </CustomButton>
  );
};

export default Auth;

//BUG maybe refesh page after sign out
