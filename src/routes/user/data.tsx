import { useQueryClient } from "@tanstack/solid-query";
import { route } from "routes-gen";
import type { ParentComponent } from "solid-js";
import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { A, ErrorMessage, Navigate } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import { Transition } from "solid-transition-group";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import ProtectedUser from "~/components/ProtectedUser";
import TransitionFade from "~/components/TransitionFade";
import {
  removeAccountAndData,
  removeArticle,
  removePersonal,
  removeTheir,
} from "~/server/user/userMutations";
import { getArticles, getPersonal, getTheirs } from "~/server/user/userQueries";

const Box: ParentComponent = (props) => {
  return (
    <div class="my-8 flex w-11/12 max-w-2xl flex-col items-center justify-center gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
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
    goals_after: "Life goals after illness:",
    responded_to_telling: "How people responded to you:",
    life_satisfaction_description: "Your life satisfaction:",
    what_others_should_know: "What others should know about illness:",
    not_have_schizophrenia_description: "Have or not have schizophrenia:",
  };

  const queryClient = useQueryClient();

  const [showPersonal, setShowPersonal] = createSignal(false);
  const [showTheirs, setShowTheirs] = createSignal(false);
  const [showArticles, setShowArticles] = createSignal(false);
  const [showDeleteAccount, setShowDeleteAccount] = createSignal(false);
  const [pageTheir, setPageTheir] = createSignal(0);

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

  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-start gap-16 bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <ErrorBoundary
        fallback={(e) => (
          <Show when={e.message === "Session not found"}>
            <HttpStatusCode code={e.status} />
            <ErrorMessage error={e} />
          </Show>
        )}
      >
        <h1 class="my-28 text-3xl font-bold lg:my-40 lg:text-4xl">
          Your account and data
        </h1>
        <Suspense>
          <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
            <h2 class="text-center text-2xl font-bold lg:text-3xl">
              Delete account
            </h2>
            <p class="text-center text-lg">
              Deletes both your account and all data you have submitted.
            </p>

            <Show when={removeAccAndDataMut.isSuccess}>
              <Navigate href={"/"} />
            </Show>

            <CustomButton
              class="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
              onClick={() => {
                setShowDeleteAccount(!showDeleteAccount());
              }}
            >
              {`${!showDeleteAccount() ? "Show" : "Close"}`}
            </CustomButton>

            <CssTranstionGrow visible={showDeleteAccount()}>
              <div class="flex flex-col items-center justify-center gap-16 rounded-lg border-2 border-fuchsia-600 p-8">
                <h2 class="text-center text-2xl font-bold lg:text-3xl">
                  Are you sure you want to delete all your data?
                </h2>
                <div class="flex flex-col items-center justify-center gap-8">
                  <CustomButton
                    class=" bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600"
                    onClick={() => {
                      removeAccAndDataMut.mutateAsync();
                    }}
                  >
                    Delete account and data
                  </CustomButton>
                  <CustomButton
                    onClick={() => {
                      setShowDeleteAccount(false);
                    }}
                  >
                    Cancel deleting account/data
                  </CustomButton>
                </div>
              </div>
            </CssTranstionGrow>
          </div>

          <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
            <h2 class="text-center text-2xl font-bold lg:text-3xl">
              Personal poll data
            </h2>
            <Show
              when={personal.data}
              fallback={
                <div class="flex w-full flex-col items-center justify-center gap-8">
                  <p class="text-center text-lg">
                    You haven't submitted personal poll data yet
                  </p>
                  <A
                    class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                    href={route("/questionares/")}
                    noScroll={false}
                  >
                    Do personal poll
                  </A>
                </div>
              }
            >
              <CustomButton
                onClick={() => {
                  setShowPersonal(() => !showPersonal());
                }}
              >
                {`${
                  !showPersonal() ? "Show" : "Close"
                } personal questions data`}
              </CustomButton>
              <Suspense>
                <TransitionFade>
                  <Show when={showPersonal()}>
                    <Box>
                      <CustomButton
                        onClick={() => {
                          removePersonalMut.mutateAsync();
                        }}
                      >
                        Delete this personal poll data
                      </CustomButton>
                      <For
                        each={
                          Object.keys(headers) as Array<keyof typeof headers>
                        }
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
                    </Box>
                  </Show>
                </TransitionFade>
              </Suspense>
            </Show>
          </div>

          <div class="flex w-11/12 max-w-2xl flex-col items-center justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
            <h2 class="text-center text-2xl font-bold lg:text-3xl">
              Other poll data
            </h2>
            <Show
              when={their.data}
              fallback={
                <div class="flex w-full flex-col items-center justify-center gap-8">
                  <p class="text-center text-lg">
                    You haven't submitted other poll data yet
                  </p>
                  <A
                    class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                    href={route("/questionares/")}
                    noScroll={false}
                  >
                    Do other poll
                  </A>
                </div>
              }
            >
              <CustomButton
                class="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
                onClick={() => {
                  setShowTheirs(() => !showTheirs());
                }}
              >
                {`${!showTheirs() ? "Show" : "Close"} your other poll data`}
              </CustomButton>
              <Suspense>
                <CssTranstionGrow visible={showTheirs()}>
                  <Box>
                    <div class="flex items-center justify-center">
                      <CustomButton
                        class={pageTheir() === 0 ? "invisible" : ""}
                        onClick={() => {
                          setPageTheir((prev) => (prev === 0 ? 0 : prev - 1));
                        }}
                      >
                        Back
                      </CustomButton>
                      <h5 class="text-lg font-bold">{`Page: ${
                        pageTheir() + 1
                      }/${Math.floor(Number(their.data?.length) + 1)}`}</h5>

                      <CustomButton
                        class={
                          their.data?.length === pageTheir() ? "invisible" : ""
                        }
                        onClick={() => {
                          setPageTheir((prev) =>
                            their.data?.length < prev - 1 ? prev : prev + 1
                          );
                        }}
                      >
                        Next
                      </CustomButton>
                    </div>
                    <CustomButton
                      onClick={() => {
                        removeTheirMut.mutateAsync({
                          id: their.data[pageTheir()].id,
                        });
                      }}
                    >
                      Delete this poll data
                    </CustomButton>
                    <Show when={their.data[pageTheir()].personality_before}>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Their personality before:
                      </h2>
                      <p>{their.data[pageTheir()].personality_before}</p>
                    </Show>
                    <Show when={their.data[pageTheir()].personality_after}>
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        Their personality after:
                      </h2>

                      <p>{their.data[pageTheir()].personality_after}</p>
                    </Show>
                    <Show
                      when={their.data[pageTheir()].what_others_should_know}
                    >
                      <h2 class="text-2xl font-bold lg:text-3xl">
                        What others should know about schizophrenia:
                      </h2>
                      <p>{their.data[pageTheir()].what_others_should_know}</p>
                    </Show>
                  </Box>
                </CssTranstionGrow>
              </Suspense>
            </Show>
          </div>
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
            <CssTranstionGrow
              visible={showArticles()}
              duration={articles.data?.length * 0.01}
            >
              <Show
                when={articles.data}
                fallback={
                  <div class="text-lg font-bold">
                    No articles submitted found
                  </div>
                }
              >
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
              </Show>
            </CssTranstionGrow>
          </Suspense>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

export default Page;

//TODO suspense should be under errorBoundary1
