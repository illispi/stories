import { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionSlide: ParentComponent = (props) => {
  return (
    <Transition
      onBeforeExit={() => {
        document.body.dataset.scrollY = String(window.scrollY);
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
  );
};
export default TransitionSlide;
