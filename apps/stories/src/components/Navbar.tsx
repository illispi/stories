import type { Accessor, Component, Setter } from "solid-js";
import { Show, createSignal } from "solid-js";
import { A, Title } from "solid-start";
import { route } from "routes-gen";
import { Presence, Motion } from "@motionone/solid";
import AuthShowcase from "./Auth";

const Hamburger: Component<{
  menuOpen: Accessor<boolean>;
  setMenuOpen: Setter<boolean>;
}> = (props) => {
  return (
    <div class="relative">
      <div class="flex items-center justify-center transition-transform active:scale-125">
        <button onClick={() => props.setMenuOpen(!props.menuOpen())}>
          <Show
            when={props.menuOpen()}
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
        class={`fixed right-0 top-14 z-30 flex  ${
          props.menuOpen() ? `translate-x-0` : `translate-x-full`
        } w-80 flex-col transition-transform duration-300`}
      >
        Content
        <AuthShowcase />
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
