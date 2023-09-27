import type { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionSlide: ParentComponent = (props) => {
  return (
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
      mode="outin"
    >
      {props.children}
    </Transition>
  );
};
export default TransitionSlide;
