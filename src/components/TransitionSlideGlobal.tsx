import type { ParentComponent } from "solid-js";
import { Show, createEffect, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import Footer from "./Footer";

const TransitionSlideGlobal: ParentComponent = (props) => {
  const [vis, setVis] = createSignal(false);

  const [reload, setReload] = createSignal(true);
  const [scrollPrev, setScrollPrev] = createSignal(0);
  const [scrollTo, setScrollTo] = createSignal(0);
  const [scrollNow, setScrollNow] = createSignal(false);
  const [scrollReload, setScrollReload] = createSignal(0);

  createEffect(() => {
    window.addEventListener("popstate", () => {
      setScrollNow(true);
    });

    window.addEventListener("scroll", () => {
      setScrollReload(window.scrollY);
    });

    window.addEventListener("beforeunload", () => {
      localStorage.setItem("scrollPos", String(scrollReload()));
    });
  });
  return (
    <>
      <Transition
        name="slide-fade"
        onBeforeExit={() => {
          setScrollPrev(scrollTo());
          setScrollTo(window.scrollY);
          setReload(false);
          setVis(false);
        }}
        onEnter={(el, done) => {
          if (scrollNow() === true) {
            window.scrollTo(0, scrollPrev());
            setScrollNow(false);
          } else if (reload() === false) {
            window.scrollTo(0, 0);
          } else {
            window.scrollTo(0, Number(localStorage.getItem("scrollPos") ?? 0));
          }

          setVis(true);
        }}
        mode="outin"
      >
        {props.children}
      </Transition>
      <Transition mode="outin" name="slide-fade">
        <Show when={vis()}>
          <Footer />
        </Show>
      </Transition>
    </>
  );
};
export default TransitionSlideGlobal;
