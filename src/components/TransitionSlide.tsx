import type { ParentComponent } from "solid-js";
import { Show, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import Footer from "./Footer";

const TransitionSlide: ParentComponent = (props) => {
  const [vis, setVis] = createSignal(false);
  return (
    <>
      <Transition
        onBeforeExit={() => {
          document.body.dataset.scrollY = String(window.scrollY);
          setVis(false);
        }}
        onEnter={(el, done) => {
          if (document.body.dataset.nav === "true") {
            document.body.dataset.nav = "false";

            window.scrollTo(0, Number(document.body.dataset.scrollYPrev));
          } else {
            document.body.dataset.scrollYPrev = document.body.dataset.scrollY;
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
