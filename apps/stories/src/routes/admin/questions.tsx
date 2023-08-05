import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { ErrorMessage } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { accept, listSubmissions } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const [accepted, setAccepted] = createSignal(false);
  const [pOrT, setPOrT] = createSignal<
    "Personal_questions" | "Their_questions"
  >("Personal_questions");
  const [page, setPage] = createSignal(0);

  const submissions = listSubmissions(() => ({
    page: page(),
    accepted: accepted(),
    pOrT: pOrT(),
  }));

  const acceptMut = accept();

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
            <div class="my-10 flex items-center justify-between gap-4 p-4">
              <CustomButton
                class={`${
                  pOrT() === "Personal_questions" ? "bg-blue-900" : ""
                }`}
                onClick={() => setPOrT("Personal_questions")}
              >
                {`Personal`}
              </CustomButton>
              <CustomButton
                class={`${accepted() === true ? "bg-blue-900" : ""}`}
                onClick={() => setAccepted(!accepted())}
              >
                Accepted
              </CustomButton>
              <CustomButton
                class={`${pOrT() === "Their_questions" ? "bg-blue-900" : ""}`}
                onClick={() => setPOrT("Their_questions")}
              >
                {`Their`}
              </CustomButton>
            </div>
            <div class="flex max-w-xs flex-col gap-8 xl:max-w-2xl">
              <For each={submissions.data?.poll}>
                {(entry, index) => (
                  <div class="flex w-full flex-col gap-2 rounded-3xl bg-blue-200 p-8">
                    <div class="m-8 flex items-center justify-between">
                      <h3 class="text-xl font-bold">{index()}</h3>
                      <Show
                        when={accepted()}
                        fallback={
                          <CustomButton
                            onclick={() => {
                              acceptMut.mutateAsync({
                                id: entry.id,
                                pOrT: pOrT(),
                              });
                              submissions.refetch();
                            }}
                          >
                            Accept
                          </CustomButton>
                        }
                      >
                        <CustomButton>Remove</CustomButton>
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
                Math.floor(submissions.data?.total / 50) + 1
              }`}</h5>

              <CustomButton
                class={
                  submissions.data?.total / ((page() + 1) * 50) <= 1
                    ? "invisible"
                    : ""
                }
                onClick={() =>
                  setPage((prev) =>
                    submissions.data?.total / ((prev + 1) * 50) <= 1
                      ? prev
                      : prev + 1
                  )
                }
              >
                Next
              </CustomButton>
            </div>
          </ErrorBoundary>
        </Suspense>
      </div>
    </>
  );
});

export default Page;
