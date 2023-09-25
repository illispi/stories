import type { ParentComponent } from "solid-js";
import { Show, createEffect, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import Footer from "./Footer";

const TransitionSlide: ParentComponent = (props) => {
  const [vis, setVis] = createSignal(false);

  const [scrollPrev, setScrollPrev] = createSignal(0);
  const [scrollTo, setScrollTo] = createSignal(0);
  const [scrollNow, setScrollNow] = createSignal(false);

  createEffect(() => {
    window.addEventListener("popstate", () => {
      setScrollNow(true);
    });
  });
  return (
    <>
      <Transition
        onBeforeExit={() => {
          setScrollPrev(scrollTo());
          setScrollTo(window.scrollY);
          setVis(false);
        }}
        onEnter={(el, done) => {
          if (scrollNow() === true) {
            window.scrollTo(0, scrollPrev());
            setScrollNow(false);
          } else {
            window.scrollTo(0, 0);
          }

          const a = el.animate(
            [
              {
                opacity: 0,
                transform: "translate(100px)",
                easing: "ease-out",
              },
              { opacity: 1, transform: "translate(0)" },
            ],
            {
              duration: 300,
            }
          );
          setVis(true);
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate(
            [
              {
                opacity: 1,
                transform: "translate(0)",
                easing: "ease-in",
              },
              { opacity: 0, transform: "translate(-100px)" },
            ],
            {
              duration: 300,
            }
          );
          a.finished.then(done);
        }}
        mode="outin"
      >
        {props.children}
      </Transition>
      <Transition
        onEnter={(el, done) => {
          const a = el.animate(
            [
              {
                opacity: 0,
                transform: "translate(100px)",
                easing: "ease-out",
              },
              { opacity: 1, transform: "translate(0)" },
            ],
            {
              duration: 300,
            }
          );
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate(
            [
              {
                opacity: 1,
                transform: "translate(0)",
                easing: "ease-in",
              },
              { opacity: 0, transform: "translate(-100px)" },
            ],
            {
              duration: 300,
            }
          );
          a.finished.then(done);
        }}
      >
        <Show when={vis()}>
          <Footer />
        </Show>
      </Transition>
    </>
  );
};
export default TransitionSlide;
