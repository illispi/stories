import {
  SubmitHandler,
  createForm,
  getValue,
  reset,
  setValue,
  valiForm,
} from "@modular-forms/solid";
import { route } from "routes-gen";
import type { ParentComponent } from "solid-js";
import { For, Show, Suspense, createEffect, createSignal } from "solid-js";
import { A, Navigate } from "solid-start";
import { Input, maxLength, minLength, nullable, object, optional, string } from "valibot";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import PaginationNav from "~/components/PaginationNav";
import ProtectedUser from "~/components/ProtectedUser";
import TransitionFade from "~/components/TransitionFade";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";

const Box: ParentComponent = (props) => {
  return (
    <div class="my-8 flex w-11/12 max-w-2xl flex-col items-center justify-center gap-16 overflow-hidden rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
      {props.children}
    </div>
  );
};

const PersonalFormSchema = object({
  describe_hospital: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  what_kind_of_care_after: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  personality_before: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  personality_after: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  other_help: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  goals_after: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ) ,null),
  responded_to_telling: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  life_satisfaction_description: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  what_others_should_know: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
  not_have_schizophrenia_description: optional(nullable(
    string([
      maxLength(600, "Your text is too long! (Max. 600 characters)"),
      minLength(4, 'Your text is too short, even "okay" is enough'),
    ])
  ), null),
});

type PersonalForm = Input<typeof PersonalFormSchema>;

export const { routeData, Page } = ProtectedUser((session) => {
  //TODO test roles
  console.log(session);
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

  const utils = trpc.useContext();

  const [showPersonal, setShowPersonal] = createSignal(false);
  const [showTheirs, setShowTheirs] = createSignal(false);
  const [showArticles, setShowArticles] = createSignal(false);
  const [showDeleteAccount, setShowDeleteAccount] = createSignal(false);
  const [pageTheir, setPageTheir] = createSignal(0);
  const [pageArticles, setPageArticles] = createSignal(0);
  const [personalEdit, setPersonalEdit] = createSignal(false);

  const [dir, setDir] = createSignal(1);

  const removeAccAndDataMut = trpc.removeAccountAndData.useMutation();

  const personal = trpc.getPersonal.useQuery();
  const their = trpc.getTheirs.useQuery();
  const articles = trpc.getArticles.useQuery();

  const removePersonalMut = trpc.removePersonal.useMutation(() => ({
    onSuccess: () => utils.getPersonal.invalidate(),
  }));
  const removeTheirMut = trpc.removeTheir.useMutation(() => ({
    onSuccess: () => utils.getTheirs.invalidate(),
  }));
  const removeArticleMut = trpc.removeArticle.useMutation(() => ({
    onSuccess: () => utils.getArticles.invalidate(),
  }));
  const editPersonalMut = trpc.editPersonal.useMutation(() => ({
    onSuccess: () => utils.getPersonal.invalidate(),
  }));

  const [personalForm, { Form, Field }] = createForm<PersonalForm>({
    validate: valiForm(PersonalFormSchema),
  });

  createEffect(() => {
    if (personal.data) {
      const arrKeys = Object.keys(headers);
      const initial = Object.fromEntries(
        arrKeys
          .filter((e) => personal.data?.[e])
          .map((k) => [k, personal.data?.[k]])
      );
      arrKeys.forEach((e) => setValue(personalForm, e, initial?.[e]));
    }
  });

  const handleEditPersonal: SubmitHandler<PersonalForm> = async (
    values,
    event
  ) => {
    editPersonalMut.mutateAsync({ ...personal.data, ...values });
    setPersonalEdit(false);
  };

  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-start gap-16 bg-slate-100 py-20 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <h1 class="my-28 text-4xl font-bold lg:my-40 lg:text-6xl">
        Your account and data
      </h1>

      <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-12 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
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
            {`${!showPersonal() ? "Show" : "Close"} personal questions data`}
          </CustomButton>

          <TransitionFade>
            <Show when={showPersonal()}>
              <div class="flex flex-col items-center justify-start gap-8">
                <CustomButton
                  class="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"
                  onClick={() => {
                    removePersonalMut.mutateAsync();
                  }}
                >
                  Delete this personal poll data
                </CustomButton>
                <Show
                  when={!personalEdit()}
                  fallback={
                    <CustomButton
                      onClick={() => {
                        setPersonalEdit(false);
                      }}
                    >
                      Cancel editing personal poll data
                    </CustomButton>
                  }
                >
                  <CustomButton
                    onClick={() => {
                      setPersonalEdit(true);
                    }}
                  >
                    Edit this personal poll data
                  </CustomButton>
                </Show>
                <h4 class="text-lg font-semibold">{`status: ${
                  personal.data?.accepted
                    ? "Accepted"
                    : personal.data?.accepted === null
                    ? "Pending"
                    : "Declined"
                }`}</h4>
                <Show when={!personal.data?.accepted}>
                  {personal.data?.decline_reason}
                </Show>

                <Show
                  when={!personalEdit()}
                  fallback={
                    <Form onSubmit={handleEditPersonal}>
                      <For
                        each={
                          Object.keys(headers) as Array<keyof typeof headers>
                        }
                      >
                        {(el) => (
                          <div classList={{ ["hidden"]: !personal.data?.[el] }}>
                            <h2 class="text-2xl font-bold lg:text-3xl">
                              {headers[el]}
                            </h2>
                            <Field name={el}>
                              {(field, props) => (
                                <>
                                  <textarea
                                    class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
                                    {...props}
                                    cols={20}
                                    rows={8}
                                    required
                                    autocomplete="off"
                                    value={field.value}
                                  />
                                  {field.error && <div>{field.error}</div>}
                                </>
                              )}
                            </Field>
                          </div>
                        )}
                      </For>
                      <CustomButton
                        onClick={() => {
                          Object.keys(headers).forEach((e) => {
                            setValue(
                              personalForm,
                              e,
                              getValue(personalForm, e)?.length
                                ? getValue(personalForm, e)
                                : null
                            );
                          });
                        }}
                        type="submit"
                      >
                        Submit Edit
                      </CustomButton>
                    </Form>
                  }
                >
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
                </Show>
              </div>
            </Show>
          </TransitionFade>
        </Show>
      </div>

      <div class="flex w-11/12 max-w-2xl flex-col items-center justify-start gap-12 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
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

          <CssTranstionGrow visible={showTheirs()}>
            <Show when={their.data}>
              {(their) => (
                <div class="flex w-full flex-col gap-16">
                  <div class="flex items-center justify-center">
                    <PaginationNav
                      arrLength={their().length}
                      page={pageTheir()}
                      perPageNum={1}
                      setPage={setPageTheir}
                      classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
                      dirSetter={setDir}
                    />
                  </div>

                  <TransitionSlide dir={dir()}>
                    <Show when={pageTheir() === 0 ? true : pageTheir()} keyed>
                      <div class="flex flex-col items-center justify-center gap-8 ">
                        <CustomButton
                          class="bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600"
                          onClick={() => {
                            removeTheirMut.mutateAsync({
                              id: their()[pageTheir()].id,
                            });
                          }}
                        >
                          Delete this poll data
                        </CustomButton>
                        <Show when={their()[pageTheir()].personality_before}>
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            Their personality before:
                          </h2>
                          <p>{their()[pageTheir()].personality_before}</p>
                        </Show>
                        <Show when={their()[pageTheir()].personality_after}>
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            Their personality after:
                          </h2>

                          <p>{their()[pageTheir()].personality_after}</p>
                        </Show>
                        <Show
                          when={their()[pageTheir()].what_others_should_know}
                        >
                          <h2 class="text-2xl font-bold lg:text-3xl">
                            What others should know about schizophrenia:
                          </h2>
                          <p>{their()[pageTheir()].what_others_should_know}</p>
                        </Show>
                      </div>
                    </Show>
                  </TransitionSlide>
                </div>
              )}
            </Show>
          </CssTranstionGrow>
        </Show>
      </div>

      <div class="flex w-11/12 max-w-2xl flex-col items-center justify-start gap-12 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
        <h2 class="text-center text-2xl font-bold lg:text-3xl">
          Your submitted articles
        </h2>
        <Show
          when={their.data}
          fallback={
            <div class="flex w-full flex-col items-center justify-center gap-8">
              <p class="text-center text-lg">
                You haven't submitted any articles yet
              </p>
              <A
                class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                href={route("/articles/")}
                noScroll={false}
              >
                Submit articles
              </A>
            </div>
          }
        >
          <CustomButton
            class="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
            onClick={() => {
              setShowArticles(() => !showArticles());
            }}
          >
            {`${!showArticles() ? "Show" : "Close"} your submitted articles`}
          </CustomButton>

          <CssTranstionGrow visible={showArticles()}>
            <Show when={articles.data}>
              {(articles) => (
                <div class="flex w-full flex-col gap-16">
                  <div class="flex items-center justify-center">
                    <PaginationNav
                      arrLength={articles().length}
                      page={pageArticles()}
                      perPageNum={5}
                      setPage={setPageArticles}
                      classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
                      dirSetter={setDir}
                    />
                  </div>
                  <TransitionSlide dir={dir()}>
                    <Show
                      when={pageArticles() === 0 ? true : pageArticles()}
                      keyed
                    >
                      <div class="flex flex-col items-center justify-center gap-8 border-t-fuchsia-600">
                        <For
                          each={articles().slice(
                            pageArticles() * 5,
                            pageArticles() * 5 + 5
                          )}
                        >
                          {(fiveArticles) => (
                            <div class="flex w-full flex-col items-center justify-center gap-8">
                              <CustomButton
                                class="bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600"
                                onClick={() => {
                                  removeArticleMut.mutateAsync({
                                    id: fiveArticles.id,
                                  });
                                }}
                              >
                                Delete this article
                              </CustomButton>
                              <a
                                class="flex-1 text-lg text-fuchsia-600 transition-all visited:text-fuchsia-800 hover:scale-110"
                                href={fiveArticles.link}
                              >
                                {fiveArticles.link}
                              </a>
                              <p class="w-full flex-1 border-b-2 border-b-fuchsia-400 pb-8 text-base">
                                {fiveArticles.description}
                              </p>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </TransitionSlide>
                </div>
              )}
            </Show>
          </CssTranstionGrow>
        </Show>
      </div>

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
    </div>
  );
});

export default Page;

//BUG counting in articles is messed up, only in SSR
