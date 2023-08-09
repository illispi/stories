import { getSession } from "@solid-mediakit/auth";
import { signIn, signOut } from "@solid-auth/base/client";
import type { VoidComponent } from "solid-js";
import { createServerData$ } from "solid-start/server";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import CustomButton from "./CustomButton";

const createSession = () => {
  return createServerData$(async (_, event) => {
    return await getSession(event.request, authOpts);
  });
};

const Auth: VoidComponent = () => {
  const sessionData = createSession();
  return (
    <CustomButton
      class="w-44"
      onClick={
        sessionData()
          ? () => void signOut({ redirectTo: "/", redirect: true })
          : () => void signIn()
      }
    >
      {sessionData() ? "Sign out" : "Sign in/up"}
    </CustomButton>
  );
};

export default Auth;

//BUG maybe refesh page after sign out
