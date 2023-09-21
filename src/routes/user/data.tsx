import { useQueryClient } from "@tanstack/solid-query";
import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { ErrorMessage, Navigate } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedUser from "~/components/ProtectedUser";
import {
  removeAccountAndData,
  removePersonal,
  removeTheir,
} from "~/server/user/userMutations";
import { getPersonal, getTheirs } from "~/server/user/userQueries";

export const { routeData, Page } = ProtectedUser((session) => {
  //TODO DELETE PERSONAL AND MULTIPLE THEIR
  //TODO test roles

  //NOTE only delete, no edit, due to validation
  const queryClient = useQueryClient();

  const [showPersonal, setShowPersonal] = createSignal(false);
  const [showTheirs, setShowTheirs] = createSignal(false);
  const removeAccAndDataMut = removeAccountAndData();
  const personal = getPersonal();
  const removePersonalMut = removePersonal(() => ({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["getPersonal"] }),
  }));
  const removeTheirMut = removeTheir(() => ({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getTheirs"] }),
  }));
  const their = getTheirs();
  console.log(personal.data); //BUG without this, SSR doesnt work
  console.log(their.data); //BUG without this, SSR doesnt work

  return (
    <div class="flex flex-col items-center justify-start">
      <Suspense>
        <ErrorBoundary
          fallback={(e) => (
            <Show when={e.message === "Session not found"}>
              <HttpStatusCode code={e.status} />
              <ErrorMessage error={e} />
            </Show>
          )}
        >
          <Show when={removeAccAndDataMut.isSuccess}>
            <Navigate href={"/"} />
          </Show>
          <CustomButton
            class="my-32"
            onClick={() => {
              removeAccAndDataMut.mutateAsync();
            }}
          >
            Delete account and data
          </CustomButton>
          <CustomButton
            onClick={() => {
              setShowPersonal(() => !showPersonal());
            }}
          >
            Show personal questions data
          </CustomButton>
          <Show when={showPersonal()}>
            <Suspense>
              <Show
                when={personal.data != "No personal poll data found"}
                fallback={<p>No personal data found yet</p>}
              >
                <>
                  <CustomButton
                    onClick={() => {
                      removePersonalMut.mutateAsync();
                    }}
                  >
                    Delete this personal poll data
                  </CustomButton>
                  <p>{personal.data?.describe_hospital}</p>
                  <p>{personal.data?.what_kind_of_care_after}</p>
                  <p>{personal.data?.personality_before}</p>
                  <p>{personal.data?.personality_after}</p>
                  <p>{personal.data?.other_help}</p>
                  <p>{personal.data?.goals_after}</p>
                  <p>{personal.data?.responded_to_telling}</p>
                  <p>{personal.data?.life_satisfaction_description}</p>
                  <p>{personal.data?.what_others_should_know}</p>
                  <p>{personal.data?.not_have_schizophrenia_description}</p>
                </>
              </Show>
            </Suspense>
          </Show>
          <CustomButton
            onClick={() => {
              setShowTheirs(() => !showTheirs());
            }}
          >
            Show your other poll data
          </CustomButton>
          <Show when={showTheirs()}>
            <Suspense>
              <For each={their.data}>
                {(their) => (
                  <>
                    <CustomButton
                      onClick={() => {
                        removeTheirMut.mutateAsync({ id: their.id });
                      }}
                    >
                      Delete this poll data
                    </CustomButton>

                    <p>{their.personality_before}</p>
                    <p>{their.personality_after}</p>
                    <p>{their.what_others_should_know}</p>
                  </>
                )}
              </For>
            </Suspense>
          </Show>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

export default Page;
