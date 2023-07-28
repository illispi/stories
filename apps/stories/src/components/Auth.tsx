import { getSession } from "@auth/solid-start";
import { signIn, signOut } from "@auth/solid-start/client";
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
      onClick={sessionData() ? () => void signOut() : () => void signIn()}
    >
      {sessionData() ? "Sign out" : "Sign in/up"}
    </CustomButton>
  );
};

export default Auth;
