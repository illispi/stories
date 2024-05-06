import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { eden } from "~/app";
import LoginA from "./LoginA";
import { handleEden } from "~/utils/handleEden";
import { serverFetch } from "~/utils/serverFetch";

const Auth: VoidComponent = () => {
  const authQuery = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () =>
      handleEden(await serverFetch(eden.api.auth.status.get)),
  }));


  const queryClient = useQueryClient();

  const logOutMut = createMutation(() => ({
    mutationFn: async () => handleEden(await eden.api.auth.logout.post()),
    // onSuccess: () => setTodo(Create(todoInsertSchema)),
    onSuccess: () => queryClient.invalidateQueries(),
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
