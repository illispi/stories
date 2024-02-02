import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";

import { createMutation, createQuery } from "@tanstack/solid-query";
import { eden } from "~/app";
import { handleEden } from "~/utils";
import LoginA from "./LoginA";

const Auth: VoidComponent = () => {
  const authQuery = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () => handleEden(await eden.api.auth.status.get()),
  }));

  const logOutMut = createMutation(() => ({
    mutationFn: async () => handleEden(await eden.api.auth.logout.post()),
    // onSuccess: () => setTodo(Create(todoInsertSchema)),
  }));

  return (
    <Show when={authQuery.data} fallback={<LoginA />}>
      <CustomButton
        onClick={() => {
          logOutMut.mutate();
        }}
        class="w-44">
        Sign out
      </CustomButton>
    </Show>
  );
};

export default Auth;
