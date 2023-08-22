import {
  Component,
  ErrorBoundary,
  For,
  Show,
  Suspense,
  createEffect,
  createSignal,
} from "solid-js";
import { useSearchParams } from "solid-start";
import CustomButton from "~/components/CustomButton";
import { articlesPagination } from "~/server/basic/queries";

const articles: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = createSignal(Number(searchParams.page ?? 1) - 1 ?? 0);
  const articlesData = articlesPagination(
    () => ({ page: page() }),
    () => ({
      placeholderData: (prev) => prev,
    })
  );

  createEffect(() => {
    console.log(page());
  });

  return (
    <div class="my-16 flex w-full flex-col items-center justify-start gap-8">
      <Suspense>
        <Show when={articlesData.data?.count}>
          {(data) => (
            <div class="m-16 flex w-full max-w-md items-center justify-around">
              <CustomButton
                class={page() === 0 ? "invisible" : ""}
                onClick={() => {
                  setPage((prev) => (prev === 0 ? 0 : prev - 1));
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Back
              </CustomButton>
              <h5 class="text-lg font-bold">{`Page: ${page() + 1}/${
                Math.floor(Number(data().count) / 25) + 1
              }`}</h5>

              <CustomButton
                class={
                  Number(data().count) / ((page() + 1) * 25) <= 1
                    ? "invisible"
                    : ""
                }
                onClick={() => {
                  setPage((prev) =>
                    Number(data().count) / ((prev + 1) * 25) <= 1
                      ? prev
                      : prev + 1
                  );
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Next
              </CustomButton>
            </div>
          )}
        </Show>
      </Suspense>
      <For
        each={articlesData.data?.articles}
        fallback={<h2>No articles found yet!</h2>}
      >
        {(article) => (
          <div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16 ">
            <a
              class="flex-1 text-lg text-fuchsia-600 visited:text-fuchsia-950"
              href={article.link}
            >
              {article.link}
            </a>
            <p class="flex-1 text-base">{article.description}</p>
          </div>
        )}
      </For>
      <Suspense>
        <Show when={articlesData.data?.count}>
          {(data) => (
            <div class="m-16 flex w-full max-w-md items-center justify-around">
              <CustomButton
                class={page() === 0 ? "invisible" : ""}
                onClick={() => {
                  setPage((prev) => (prev === 0 ? 0 : prev - 1));
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Back
              </CustomButton>
              <h5 class="text-lg font-bold">{`Page: ${page() + 1}/${
                Math.floor(Number(data().count) / 25) + 1
              }`}</h5>

              <CustomButton
                class={
                  Number(data().count) / ((page() + 1) * 25) <= 1
                    ? "invisible"
                    : ""
                }
                onClick={() => {
                  setPage((prev) =>
                    Number(data().count) / ((prev + 1) * 25) <= 1
                      ? prev
                      : prev + 1
                  );
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Next
              </CustomButton>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
};

export default articles;
