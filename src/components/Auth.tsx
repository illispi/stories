import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";
import { auth } from "~/auth/lucia";

import LoginA from "./LoginA";
import { action, cache, createAsync } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { createQuery } from "@tanstack/solid-query";
import { handleEden } from "~/utils";
import { eden } from "~/app";
import { lucia } from "~/lib/auth/lucia";

const Auth: VoidComponent = () => {
  const authQuery = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () => handleEden(await eden.api.auth.get()),
  }));

  return (
    <Show when={authQuery.data} fallback={<LoginA />}>
      <CustomButton
        onClick={() => {
          signOut();
        }}
        class="w-44">
        Sign out
      </CustomButton>
    </Show>
  );
};

export default Auth;
