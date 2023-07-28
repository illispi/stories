import { route } from "routes-gen";
import type { Accessor, Component, Setter } from "solid-js";
import { Show, createEffect, createSignal } from "solid-js";
import { A, Title, useSearchParams } from "solid-start";
import Auth from "./Auth";
import { createServerData$ } from "solid-start/server";
import { getSession } from "@auth/solid-start";
import { authOpts } from "~/routes/api/auth/[...solidauth]";

const createSession = () => {
  return createServerData$(async (_, event) => {
    return await getSession(event.request, authOpts);
  });
};

const MenuItem = (props) => {
  return (
    <>
      <A
        class={`text-3xl font-light uppercase transition-all hover:scale-110 ${props.class}`}
        href={props.route}
      >
        {props.content}
      </A>
    </>
  );
};

const Hamburger: Component<{
  menuOpen: Accessor<boolean>;
  setMenuOpen: Setter<boolean>;
}> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionData = createSession();

  createEffect(() => {
    window.addEventListener("popstate", function (event) {
      if (searchParams.nav === "true") {
        setSearchParams({ nav: null });
      }
    });

    //TODO if open and close nav and then go back history is gone
    //BUG on mobile refresh has nav on bit weird position, might be able to solve with start disabled, see personalQuestions.tsx motion.one
  });

  return (
    <div class="relative">
      <div class="flex items-center justify-center transition-transform active:scale-125">
        <button
          class="transition-transform duration-200 ease-out hover:scale-125"
          onClick={() => {
            if (searchParams.nav === "true") {
              setSearchParams({ nav: null });
            } else {
              setSearchParams({ nav: true });
            }
          }}
        >
          <Show
            when={searchParams.nav === "true"}
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width={2}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width={2}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Show>
        </button>
      </div>
      <div
        class={`fixed right-0 top-14 z-30 flex items-center justify-start gap-6 p-8 ${
          searchParams.nav === "true"
            ? `translate-x-0 opacity-100 ease-out`
            : `translate-x-full opacity-0 ease-in`
        } h-screen w-80 flex-col bg-amber-200 transition-all duration-300`}
      >
        <Auth />
        <Show when={sessionData()}>
          <MenuItem route={"/"} content="Your data" />
        </Show>
        <div class="w-full border-b-2 border-black" />
        <MenuItem class="mt-8" route={"/"} content="results" />
        <MenuItem route={"/"} content="poll" />
        <MenuItem route={"/"} content="Articles" />
        <button
          class="p-16 transition-all hover:scale-125"
          onClick={() => {
            setSearchParams({ nav: null });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="0.6"
            stroke="currentColor"
            class="h-16 w-16"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const NavBar: Component = () => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  return (
    <>
      <Title>Home</Title>
      <div class="sticky top-0 z-40 flex w-full items-center justify-between bg-gradient-to-b from-blue-200 to-blue-300 p-3">
        <A noScroll={true} href={route("/")}>
          <div class="mx-2 text-2xl font-semibold">Schizopoll</div>
        </A>

        <Hamburger menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      </div>
    </>
  );
};

export default NavBar;
