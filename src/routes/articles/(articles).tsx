import {
  Component,
  ErrorBoundary,
  For,
  Show,
  Suspense,
  createSignal,
} from "solid-js";
import CustomButton from "~/components/CustomButton";
import { articlesPagination } from "~/server/basic/queries";

const articles: Component = () => {
  const [page, setPage] = createSignal(0);
  const articlesData = articlesPagination(
    () => ({ page: page() }),
    () => ({
      placeholderData: (prev) => prev,
    })
  );

  return (
    <div class="my-16 flex w-full flex-col items-center justify-start gap-4">
      <For each={articlesData.data} fallback={<h2>No articles found yet!</h2>}>
        {(article) => (
          <div class="max-w-prose">
            <a href={article.link}>{article.link}</a>
            <p>{article.description}</p>
          </div>
        )}
      </For>
      <Suspense>
        <Show when={articlesData.data}>
          {(articles) => (
            <div class="m-16 flex w-full items-center justify-around">
              <CustomButton
                class={page() === 0 ? "invisible" : ""}
                onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
              >
                Back
              </CustomButton>
              <h5 class="text-lg font-bold">{`Page: ${page() + 1}/${
                Math.floor(articles()[0].count / 25) + 1
              }`}</h5>

              <CustomButton
                class={
                  articles()[0].count / ((page() + 1) * 25) <= 1
                    ? "invisible"
                    : ""
                }
                onClick={() =>
                  setPage((prev) =>
                    articles()[0].count / ((prev + 1) * 25) <= 1
                      ? prev
                      : prev + 1
                  )
                }
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