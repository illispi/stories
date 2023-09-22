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

  //BUG now it doesnt work if this are logged, for some reason

  // console.log(personal.data); //BUG without this, SSR doesnt work
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
          >
            {`${!showPersonal() ? "Show" : "Close"} personal questions data`}
          </CustomButton>
          <Show when={showPersonal()}>
            <Suspense>
              <Show
                when={personal.data}
                fallback={<p>No personal data found yet</p>}
              >
                {(data) => (
                  <Box>
                    <ErrorBoundary
                      fallback={(e) => (
                        <Show
                          when={e.message === "No personal poll data found"}
                        >
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
                      <Show when={data().describe_hospital}>
                        <h2 class="text-2xl font-bold lg:text-3xl">
                          Describe hospital:
                        </h2>
                        <p>{data().describe_hospital}</p>
                      </Show>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        What kind of hospital care:
                      </h2>
                      <p>{data().what_kind_of_care_after}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Your personality before:
                      </h2>
                      <p>{data().personality_before}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Your personality after:
                      </h2>
                      <p>{data().personality_after}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Other help beyond medication:
                      </h2>
                      <p>{data().other_help}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Life goals after illness:
                      </h2>
                      <p>{data().goals_after}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        How people responded to you:
                      </h2>
                      <p>{data().responded_to_telling}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Your life satisfaction:
                      </h2>
                      <p>{data().life_satisfaction_description}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        What others should know about illness:
                      </h2>
                      <p>{data().what_others_should_know}</p>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Have or not have schizophrenia:
                      </h2>
                      <p>{data().not_have_schizophrenia_description}</p>
                    </ErrorBoundary>
                  </Box>
                )}
              </Show>
            </Suspense>
          </Show>
          <CustomButton
            onClick={() => {
              setShowTheirs(() => !showTheirs());
            }}
          >
            {`${!showTheirs() ? "Show" : "Close"} your other poll data`}
          </CustomButton>
          <Show when={showTheirs()}>
            {/* TODO what if this empty see personal */}
            <Suspense>
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
            </Suspense>
          </Show>
          <CustomButton
            onClick={() => {
              setShowArticles(() => !showArticles());
            }}
          >
            {`${!showArticles() ? "Show" : "Close"} your shared articles`}
          </CustomButton>
          <Show when={showArticles()}>
            {/* TODO what if this empty see personal */}
            <Suspense>
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
            </Suspense>
          </Show>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

export default Page;
