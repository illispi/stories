import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm } from "@modular-forms/solid";
import type { Component } from "solid-js";
import { For, Show, Suspense, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import type { Input } from "valibot";
import { maxLength, minLength, object, string } from "valibot";
import CustomButton from "~/components/CustomButton";
import { postArticle } from "~/server/basic/mutations";
import { articlesPagination } from "~/server/basic/queries";

const ArticleSchema = object({
  link: string([
    minLength(5, "Please enter your link to article."),
    maxLength(1000, "Your link is too long"),
  ]),
  description: string([
    minLength(10, "Article description must be at least 10 characters long."),
    maxLength(500, "Max length of article description is 500 characters."),
  ]),
});

type ArticleForm = Input<typeof ArticleSchema>;

const ArticleSubmit: Component = (props) => {
  const articleMut = postArticle();
  const [articleForm, { Form, Field }] = createForm<ArticleForm>({
    validate: valiForm(ArticleSchema),
  });
  const handleSubmit: SubmitHandler<ArticleForm> = async (values, event) => {
    console.log("hello");
    articleMut.mutateAsync(values);
  };
  return (
    <div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16 ">
      <h2 class="text-2xl font-bold lg:text-3xl">Submit article/interview</h2>
      <Form onSubmit={handleSubmit}>
        <h3>Link to article:</h3>
        <Field name="link">
          {(field, props) => (
            <>
              <input {...props} type="text" required />
              {field.error && <div>{field.error}</div>}
            </>
          )}
        </Field>
        <h3>Short description of article:</h3>
        <Field name="description">
          {(field, props) => (
            <>
              <input {...props} type="text" required />
              {field.error && <div>{field.error}</div>}
            </>
          )}
        </Field>
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
};

const articles: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = createSignal(Number(searchParams.page ?? 1) - 1 ?? 0);
  const articlesData = articlesPagination(
    () => ({ page: page() }),
    () => ({
      placeholderData: (prev) => prev,
    })
  );

  return (
    <div class="my-16 flex w-full flex-col items-center justify-start gap-8">
      <Suspense>
        <ArticleSubmit />
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
              class="flex-1 text-lg text-fuchsia-600 transition-all visited:text-fuchsia-800 hover:scale-110"
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
