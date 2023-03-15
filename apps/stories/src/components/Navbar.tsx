import {
  type ParentComponent,
  Switch,
  Match,
  createSignal,
  Component,
  Accessor,
  Setter,
} from "solid-js";
import { A, Title } from "solid-start";

const NavLinks: Component = () => {
  return (
    <div class="hidden items-center justify-center lg:flex">
      <A href="/stats">
        <div class="mx-2 text-xl font-semibold">Statistics</div>
      </A>
    </div>
  );
};

const Hamburger: Component<{
  menuOpen: Accessor<boolean>;
  setMenuOpen: Setter<boolean>;
}> = (props) => {
  return (
    <div class="flex items-center justify-center transition-transform active:scale-125 lg:hidden">
      <button onClick={() => props.setMenuOpen(!props.menuOpen())}>
        {!props.menuOpen() ? (
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
        ) : (
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
        )}
      </button>
    </div>
  );
};

const NavBar: Component = () => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  return (
    <>
      <Title>Home</Title>
      <div class="sticky top-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-blue-200 to-blue-300 p-3">
        <A href={"/"}>
          <div class="mx-2 text-2xl font-semibold">
            Schizopoll
          </div>
        </A>
       
        <Hamburger menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <NavLinks />
      </div>
    </>
  );
};

export default NavBar;
