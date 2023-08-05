import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { ErrorMessage } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { listSubmissions } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const [accepted, setAccepted] = createSignal(false);
  const [pOrT, setPOrT] = createSignal<
    "Personal_questions" | "Their_questions"
  >("Their_questions");
  const [page, setPage] = createSignal(0);

  const submissions = listSubmissions(() => ({
    page: page(),
    accepted: accepted(),
    pOrT: pOrT(),
  }));

  return (
    <>
      <div class="flex flex-col items-center gap-2">
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary
            fallback={(e) => (
              <Show when={e.message === "Session not found"}>
                <HttpStatusCode code={e.status} />
                <ErrorMessage error={e} />
              </Show>
            )}
          >
            <div class="flex flex-col gap-8">
              <For each={submissions.data?.poll}>
                {(entry) => (
                  <div class="flex flex-col gap-2">
                    <For each={Object.keys(entry)}>
                      {(keys) => (
                        <>
                          <h4>{keys}</h4>
                          <p>{entry[keys]}</p>
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
