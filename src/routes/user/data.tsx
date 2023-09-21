import { useQueryClient } from "@tanstack/solid-query";
import type { ParentComponent } from "solid-js";
import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { ErrorMessage, Navigate } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedUser from "~/components/ProtectedUser";
import {
  removeAccountAndData,
  removeArticle,
  removePersonal,
  removeTheir,
} from "~/server/user/userMutations";
import { getArticles, getPersonal, getTheirs } from "~/server/user/userQueries";

const Box: ParentComponent = (props) => {
  return (
    <div class="my-8 flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
      {props.children}
    </div>
  );
};

export const { routeData, Page } = ProtectedUser((session) => {
  //TODO test roles

  //NOTE only delete, no edit, due to validation
  const queryClient = useQueryClient();

  const [showPersonal, setShowPersonal] = createSignal(false);
  const [showTheirs, setShowTheirs] = createSignal(false);
  const [showArticles, setShowArticles] = createSignal(false);

  const removeAccAndDataMut = removeAccountAndData();

  const personal = getPersonal();
  const their = getTheirs();
  const articles = getArticles();

  const removePersonalMut = removePersonal(() => ({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["getPersonal"] }),
  }));
  const removeTheirMut = removeTheir(() => ({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getTheirs"] }),
  }));
  const removeArticleMut = removeArticle(() => ({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["getArticles"] }),
  }));

  console.log(personal.data); //BUG without this, SSR doesnt work
  console.log(their.data); //BUG without this, SSR doesnt work
  console.log(articles.data); //BUG without this, SSR doesnt work

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
                <Box>
                  <CustomButton
                    onClick={() => {
                      removePersonalMut.mutateAsync();
                    }}
                  >
                    Delete this personal poll data
                  </CustomButton>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Describe hospital:
                  </h2>
                  <p>{personal.data?.describe_hospital}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    What kind of hospital care:
                  </h2>
                  <p>{personal.data?.what_kind_of_care_after}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Your personality before:
                  </h2>
                  <p>{personal.data?.personality_before}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Your personality after:
                  </h2>
                  <p>{personal.data?.personality_after}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Other help beyond medication:
                  </h2>
                  <p>{personal.data?.other_help}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Life goals after illness:
                  </h2>
                  <p>{personal.data?.goals_after}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    How people responded to you:
                  </h2>
                  <p>{personal.data?.responded_to_telling}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Your life satisfaction:
                  </h2>
                  <p>{personal.data?.life_satisfaction_description}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    What others should know about illness:
                  </h2>
                  <p>{personal.data?.what_others_should_know}</p>
                  <h2 class="text-2xl font-bold lg:text-3xl">
                    Have or not have schizophrenia:
                  </h2>
                  <p>{personal.data?.not_have_schizophrenia_description}</p>
                </Box>
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
            {/* TODO what if this empty see personal */}
            <Suspense>
              <For each={their.data}>
                {(their) => (
                  <Box>
                    <CustomButton
                      onClick={() => {
                        removeTheirMut.mutateAsync({ id: their.id });
                      }}
                    >
                      Delete this poll data
                    </CustomButton>
                    <h2 class="text-2xl font-bold lg:text-3xl">
                      Their personality before:
                    </h2>
                    <p>{their.personality_before}</p>
                    <h2 class="text-2xl font-bold lg:text-3xl">
                      Their personality after:
                    </h2>
                    <p>{their.personality_after}</p>
                    <h2 class="text-2xl font-bold lg:text-3xl">
                      What others should know about schizophrenia:
                    </h2>
                    <p>{their.what_others_should_know}</p>
                  </Box>
                )}
              </For>
            </Suspense>
          </Show>
          <CustomButton
            onClick={() => {
              setShowArticles(() => !showArticles());
            }}
          >
            Show your shared articles
          </CustomButton>
          <Show when={showArticles()}>
            {/* TODO what if this empty see personal */}
            <Suspense>
              <For each={articles.data}>
                {(article) => (
                  <Box>
                    <CustomButton
                      onClick={() => {
                        removeArticleMut.mutateAsync({ id: article.id });
                      }}
                    >
                      Delete this article
                    </CustomButton>

                    <p>{article.link}</p>
                    <p>{article.description}</p>
                  </Box>
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
