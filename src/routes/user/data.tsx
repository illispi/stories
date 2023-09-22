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

  const headers = {
    describe_hospital: "Describe hospital:",
    what_kind_of_care_after: "What kind of hospital care:",
    personality_before: "Your personality before:",
    personality_after: "Your personality after:",
    other_help: "Other help beyond medication:",
    goals_after: "Life goals after illness",
    responded_to_telling: "How people responded to you:",
    life_satisfaction_description: "Your life satisfaction",
    what_others_should_know: "What others should know about illness",
    not_have_schizophrenia_description: "Have or not have schizophrenia",
  };

  const queryClient = useQueryClient();

  const [showPersonal, setShowPersonal] = createSignal(false);
  const [showTheirs, setShowTheirs] = createSignal(false);
  const [showArticles, setShowArticles] = createSignal(false);

  const removeAccAndDataMut = removeAccountAndData();

  const personal = getPersonal(undefined, () => ({
    placeholderData: (prev) => prev,
  }));
  const their = getTheirs(undefined, () => ({
    placeholderData: (prev) => prev,
  }));
  const articles = getArticles(undefined, () => ({
    placeholderData: (prev) => prev,
  }));

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

  //BUG now it doesnt work if this are logged, for some reason

  //console.log(personal.data); //BUG without this, SSR doesnt work
  // console.log(their.data); //BUG without this, SSR doesnt work
  // console.log(articles.data); //BUG without this, SSR doesnt work

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
            classList={{
              ["bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"]:
                showPersonal(),
            }}
          >
            {`${!showPersonal() ? "Show" : "Close"} personal questions data`}
          </CustomButton>
          <Suspense>
            <Show when={showPersonal()}>
              <Box>
                <ErrorBoundary
                  fallback={(e) => (
                    <Show when={e.message === "No personal poll data found"}>
                      <p>No personal poll data found</p>
                    </Show>
                  )}
                >
                  <CustomButton
                    onClick={() => {
                      removePersonalMut.mutateAsync();
                    }}
                  >
                    Delete this personal poll data
                  </CustomButton>
                  <For
                    each={Object.keys(headers) as Array<keyof typeof headers>}
                  >
                    {(el) => (
                      <Show when={personal.data?.[el]}>
                        <h2 class="text-2xl font-bold lg:text-3xl">
                          {headers[el]}
                        </h2>
                        <p>{personal.data?.[el]}</p>
                      </Show>
                    )}
                  </For>
                </ErrorBoundary>
              </Box>
            </Show>
          </Suspense>
          <CustomButton
            onClick={() => {
              setShowTheirs(() => !showTheirs());
            }}
            classList={{
              ["bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"]:
                showTheirs(),
            }}
          >
            {`${!showTheirs() ? "Show" : "Close"} your other poll data`}
          </CustomButton>
          <Suspense>
            <Show when={showTheirs()}>
              <div>
                <For each={their.data}>
                  {(their) => (
                    <Box>
                      <ErrorBoundary
                        fallback={(e) => (
                          <Show when={e.message === "No other poll data found"}>
                            <p>No other poll data found</p>
                          </Show>
                        )}
                      >
                        <CustomButton
                          onClick={() => {
                            removeTheirMut.mutateAsync({ id: their.id });
                          }}
                        >
                          Delete this poll data
                        </CustomButton>
                        <Show when={their.personality_before}>
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            Their personality before:
                          </h2>
                          <p>{their.personality_before}</p>
                        </Show>
                        <Show when={their.personality_after}>
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            Their personality after:
                          </h2>

                          <p>{their.personality_after}</p>
                        </Show>
                        <Show when={their.what_others_should_know}>
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            What others should know about schizophrenia:
                          </h2>
                          <p>{their.what_others_should_know}</p>
                        </Show>
                      </ErrorBoundary>
                    </Box>
                  )}
                </For>
              </div>
            </Show>
          </Suspense>
          <CustomButton
            onClick={() => {
              setShowArticles(() => !showArticles());
            }}
            classList={{
              ["bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"]:
                showArticles(),
            }}
          >
            {`${!showArticles() ? "Show" : "Close"} your shared articles`}
          </CustomButton>
          <Suspense>
            <Show when={showArticles()}>
              <div>
                <For each={articles.data}>
                  {(article) => (
                    <Box>
                      <ErrorBoundary
                        fallback={(e) => (
                          <Show when={e.message === "No articles found"}>
                            <p>No articles found</p>
                          </Show>
                        )}
                      >
                        <CustomButton
                          onClick={() => {
                            removeArticleMut.mutateAsync({ id: article.id });
                          }}
                        >
                          Delete this article
                        </CustomButton>

                        <p>{article.link}</p>
                        <p>{article.description}</p>
                      </ErrorBoundary>
                    </Box>
                  )}
                </For>
              </div>
            </Show>
          </Suspense>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

export default Page;
