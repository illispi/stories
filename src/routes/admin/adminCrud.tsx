import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { ErrorMessage } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";

import { useQueryClient } from "@tanstack/solid-query";
import { trpc } from "~/utils/trpc";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const [accepted, setAccepted] = createSignal<"pending" | "accepted">(
    "pending"
  );
  const [pOrT, setPOrT] = createSignal<
    "Personal_questions" | "Their_questions"
  >("Personal_questions");
  const [page, setPage] = createSignal(0);
  const [pageArticles, setPageArticles] = createSignal(0);
  const [showModal, setShowModal] = createSignal(false);
  const [entryEdit, setEntryEdit] = createSignal<number>(0);
  const [tab, setTab] = createSignal<"poll" | "articles">("poll");

  const utils = trpc.useContext();

  const submissions = trpc.listSubmissions.useQuery(() => ({
    page: page(),
    accepted: accepted(),
    pOrT: pOrT(),
  }));

  const articles = trpc.listArticles.useQuery(() => ({
    page: pageArticles(),
    accepted: accepted(),
  }));

  const acceptMut = trpc.acceptSubmission.useMutation(() => ({
    onSuccess: () => utils.listSubmissions.invalidate(),
  }));
  const declineMut = trpc.declineSubmission.useMutation(() => ({
    onSuccess: () => utils.listSubmissions.invalidate(),
  }));
  const acceptArticleMut = trpc.acceptArticle.useMutation(() => ({
    onSuccess: () => utils.listArticles.invalidate(),
  }));
  const declineArticleMut = trpc.declineArticle.useMutation(() => ({
    onSuccess: () => utils.listArticles.invalidate(),
  }));

  return (
    <>
      <div class="flex flex-col items-center">
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary
            fallback={(e) => (
              <Show when={e.message === "Session not found"}>
                <HttpStatusCode code={e.status} />
                <ErrorMessage error={e} />
              </Show>
            )}
          >
            <Show when={showModal()}>
              <dialog open>
                <div class="fixed left-0 top-0 z-40 h-screen w-screen bg-black opacity-50" />
                <div class="fixed left-1/2 top-1/2 z-50 flex gap-10 border-2 border-red-700 bg-white p-8">
                  <CustomButton
                    onClick={() => {
                      if (tab() === "poll") {
                        declineMut.mutateAsync({
                          id: entryEdit(),
                          pOrT: pOrT(),
                        });
                      } else if (tab() === "articles") {
                        declineArticleMut.mutateAsync({ id: entryEdit() });
                      }
                      setShowModal(false);
                      setEntryEdit(0);
                    }}
                  >
                    Decline
                  </CustomButton>
                  <CustomButton
                    onClick={() => {
                      setShowModal(false);
                      setEntryEdit(0);
                    }}
                  >
                    Cancel
                  </CustomButton>
                </div>
              </dialog>
            </Show>
            <CustomButton
              onClick={() => {
                setTab(tab() === "articles" ? "poll" : "articles");
              }}
            >
              {tab() === "articles"
                ? "Switch to poll CRUD"
                : "Switch to articles CRUD"}
            </CustomButton>
            <Show
              when={tab() === "poll"}
              fallback={
                <>
                  <div class="flex w-full max-w-xs flex-col gap-8 xl:max-w-2xl">
                    <For each={articles.data}>
                      {(article, index) => (
                        <div class="flex w-full flex-col gap-2 rounded-3xl bg-blue-200 p-8">
                          <div class="m-8 flex items-center justify-between">
                            <h3 class="text-xl font-bold">{index()}</h3>
                            <Show
                              when={accepted() === "accepted"}
                              fallback={
                                <>
                                  <CustomButton
                                    onclick={() => {
                                      acceptArticleMut.mutateAsync({
                                        id: article.id,
                                      });
                                    }}
                                  >
                                    Accept
                                  </CustomButton>
                                  {/* BUG This or something else should be decline and not remove */}
                                  <CustomButton
                                    onclick={() => {
                                      setEntryEdit(article.id);
                                      setShowModal(true);
                                    }}
                                  >
                                    Remove
                                  </CustomButton>
                                </>
                              }
                            >
                              <CustomButton
                                onclick={() => {
                                  setEntryEdit(article.id);
                                  setShowModal(true);
                                }}
                              >
                                Remove
                              </CustomButton>
                            </Show>
                          </div>
                          <For each={Object.keys(article)}>
                            {(keys) => (
                              <>
                                <h4 class="w-full text-lg font-bold">{keys}</h4>
                                <p class="w-full">{article[keys]}</p>
                              </>
                            )}
                          </For>
                        </div>
                      )}
                    </For>
                  </div>
                  <div class="m-16 flex w-full items-center justify-around">
                    <CustomButton
                      class={pageArticles() === 0 ? "invisible" : ""}
                      onClick={() =>
                        setPageArticles((prev) => (prev === 0 ? 0 : prev - 1))
                      }
                    >
                      Back
                    </CustomButton>
                    <h5 class="text-lg font-bold">{`Page: ${
                      pageArticles() + 1
                    }/${Math.floor(articles.data[0].count / 25) + 1}`}</h5>

                    <CustomButton
                      class={
                        articles.data[0].count / ((pageArticles() + 1) * 25) <=
                        1
                          ? "invisible"
                          : ""
                      }
                      onClick={() =>
                        setPageArticles((prev) =>
                          articles.data[0].count / ((prev + 1) * 25) <= 1
                            ? prev
                            : prev + 1
                        )
                      }
                    >
                      Next
                    </CustomButton>
                  </div>
                </>
              }
            >
              <div class="my-10 flex items-center justify-between gap-4 p-4">
                <CustomButton
                  class={`${
                    pOrT() === "Personal_questions"
                      ? "bg-blue-900 focus:bg-blue-900 active:bg-blue-900"
                      : ""
                  }`}
                  onClick={() => setPOrT("Personal_questions")}
                >
                  {`Personal`}
                </CustomButton>
                <CustomButton
                  class={`${
                    accepted() === "accepted"
                      ? "bg-blue-900 focus:bg-blue-900 active:bg-blue-900"
                      : ""
                  }`}
                  onClick={() =>
                    setAccepted(
                      accepted() === "accepted" ? "pending" : "accepted"
                    )
                  }
                >
                  Accepted
                </CustomButton>
                <CustomButton
                  class={`${
                    pOrT() === "Their_questions"
                      ? "bg-blue-900 focus:bg-blue-900 active:bg-blue-900"
                      : ""
                  }`}
                  onClick={() => setPOrT("Their_questions")}
                >
                  {`Their`}
                </CustomButton>
              </div>
              <div class="flex w-full max-w-xs flex-col gap-8 xl:max-w-2xl">
                <For each={submissions.data?.poll}>
                  {(entry, index) => (
                    <div class="flex w-full flex-col gap-2 rounded-3xl bg-blue-200 p-8">
                      <div class="m-8 flex items-center justify-between">
                        <h3 class="text-xl font-bold">{index()}</h3>
                        <Show
                          when={accepted() === "accepted"}
                          fallback={
                            <>
                              <CustomButton
                                onclick={() => {
                                  acceptMut.mutateAsync({
                                    id: entry.id,
                                    pOrT: pOrT(),
                                  });
                                }}
                              >
                                Accept
                              </CustomButton>

                              <CustomButton
                                onclick={() => {
                                  setEntryEdit(entry.id);
                                  setShowModal(true);
                                }}
                              >
                                Remove
                              </CustomButton>
                            </>
                          }
                        >
                          <CustomButton
                            onclick={() => {
                              setEntryEdit(entry.id);
                              setShowModal(true);
                            }}
                          >
                            Remove
                          </CustomButton>
                        </Show>
                      </div>
                      <For each={Object.keys(entry)}>
                        {(keys) => (
                          <>
                            <h4 class="w-full text-lg font-bold">{keys}</h4>
                            <p class="w-full">{entry[keys]}</p>
                          </>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
              <div class="m-16 flex w-full items-center justify-around">
                <CustomButton
                  class={page() === 0 ? "invisible" : ""}
                  onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
                >
                  Back
                </CustomButton>
                <h5 class="text-lg font-bold">{`Page: ${page() + 1}/${
                  Math.floor(submissions.data?.total / 25) + 1
                }`}</h5>

                <CustomButton
                  class={
                    submissions.data?.total / ((page() + 1) * 25) <= 1
                      ? "invisible"
                      : ""
                  }
                  onClick={() =>
                    setPage((prev) =>
                      submissions.data?.total / ((prev + 1) * 25) <= 1
                        ? prev
                        : prev + 1
                    )
                  }
                >
                  Next
                </CustomButton>
              </div>
            </Show>
          </ErrorBoundary>
        </Suspense>
      </div>
    </>
  );
});

export default Page;
