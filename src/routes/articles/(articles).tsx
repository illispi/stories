import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm } from "@modular-forms/solid";
import type { Component, Setter } from "solid-js";
import { For, Show, Suspense, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import type { Input } from "valibot";
import { maxLength, minLength, object, string } from "valibot";
import CustomButton from "~/components/CustomButton";
import PaginationNav from "~/components/PaginationNav";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";

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

const ArticleSubmit: Component<{ setSubmitVis: Setter<boolean> }> = (props) => {
  const articleMut = trpc.postArticle.useMutation();
  const [articleForm, { Form, Field }] = createForm<ArticleForm>({
    validate: valiForm(ArticleSchema),
  });
  const handleSubmit: SubmitHandler<ArticleForm> = async (values, event) => {
    articleMut.mutateAsync(values);
  };

  return (
    <>
      <Show
        when={!articleMut.isSuccess}
        fallback={
          <div class="relative flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl ">
            <h2 class="text-lg font-bold">
              Your article was submitted for review!
            </h2>
            <CustomButton
              onClick={() => {
                articleMut.reset();
              }}
            >
              Submit another one
            </CustomButton>
          </div>
        }
      >
        <div class="relative flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl ">
          <CustomButton
            onClick={() => {
              props.setSubmitVis(false);
            }}
            class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 bg-red-600 p-2 text-center hover:bg-red-900 active:bg-red-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </CustomButton>
          <h2 class="text-2xl font-bold lg:text-3xl">
            Submit article/interview
          </h2>
          <Form onSubmit={handleSubmit}>
            <div class="m-4 flex flex-col items-center justify-center gap-4">
              <h3 class="text-lg underline underline-offset-4">
                Link to article:
              </h3>
              <Field name="link">
                {(field, props) => (
                  <>
                    <textarea
                      class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
                      {...props}
                      cols={60}
                      rows={3}
                      required
                      autocomplete="off"
                      placeholder="link"
                    />
                    {field.error && <div>{field.error}</div>}
                  </>
                )}
              </Field>
              <h3 class="text-lg underline underline-offset-4">
                Short description of article:
              </h3>
              <Field name="description">
                {(field, props) => (
                  <>
                    <textarea
                      class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
                      {...props}
                      cols={60}
                      rows={9}
                      required
                      autocomplete="off"
                      placeholder="description"
                    />
                    {field.error && <div>{field.error}</div>}
                  </>
                )}
              </Field>
              <CustomButton type="submit">Submit</CustomButton>
            </div>
          </Form>
        </div>
      </Show>
    </>
  );
};

const articles: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = createSignal(Number(searchParams.page ?? 1) - 1 ?? 0);
  const [submitVis, setSubmitVis] = createSignal(false);
  const articlesData = trpc.articlesPagination.useQuery(
    () => ({
      page: page(),
    }),
    () => ({ placeholderData: (prev) => prev })
  );

  const [dir, setDir] = createSignal(1);

  return (
    <div class="my-16 flex w-full flex-col items-center justify-start gap-8">
      <Suspense>
        <Show
          when={submitVis()}
          fallback={
            <>
              <div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-10 rounded-3xl border-t-4 border-fuchsia-600 bg-white py-12 shadow-xl ">
                <h2 class="text-2xl font-bold lg:text-3xl">
                  Submit article/interview
                </h2>
                <CustomButton
                  onClick={() => {
                    setSubmitVis(true);
                  }}
                >
                  Submit new!
                </CustomButton>
              </div>
            </>
          }
        >
          <ArticleSubmit setSubmitVis={setSubmitVis} />
        </Show>
        <h2 class="mt-8 text-4xl font-bold">Articles:</h2>
        <Show when={articlesData.data?.count}>
          {(data) => (
            <div class="flex w-full max-w-md items-center justify-around">
              <PaginationNav
                arrLength={Number(data().count)}
                page={page()}
                perPageNum={25}
                setPage={setPage}
                classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
                dirSetter={setDir}
                backOnClick={() => {
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                nextOnClick={() => {
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </Show>
      </Suspense>

      <Show when={articlesData.data} fallback={<h2>No articles found yet!</h2>}>
        {(articles) => (
          <TransitionSlide dir={dir()}>
            <Show when={page() === 0 ? true : page()} keyed>
              <div class="flex flex-col items-center justify-center gap-8 border-t-fuchsia-600">
                <For each={articles().articles}>
                  {(twentyfiveArticles) => (
                    <div class="flex w-full flex-col items-center justify-center gap-8">
                      <div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16 ">
                        <a
                          class="flex-1 text-lg text-fuchsia-600 transition-all visited:text-fuchsia-800 hover:scale-110"
                          href={twentyfiveArticles.link}
                        >
                          {twentyfiveArticles.link}
                        </a>
                        <p class="flex-1 text-base">
                          {twentyfiveArticles.description}
                        </p>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </TransitionSlide>
        )}
      </Show>
      <Suspense>
        <Show when={articlesData.data?.count}>
          {(data) => (
            <div class="flex w-full max-w-md items-center justify-around">
              <PaginationNav
                arrLength={Number(data().count)}
                page={page()}
                perPageNum={25}
                setPage={setPage}
                classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
                dirSetter={setDir}
                backOnClick={() => {
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                nextOnClick={() => {
                  setSearchParams({ page: page() + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
};

export default articles;

//TODO does this work on real network without useTransition
