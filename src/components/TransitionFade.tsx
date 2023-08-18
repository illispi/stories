import { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionFade: ParentComponent = (props) => {
  return (
    <Transition
      onEnter={(el, done) => {
        const a = el.animate(
          [
            {
              opacity: 0,
              easing: "ease-out",
            },
            { opacity: 1 },
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

              easing: "ease-in",
            },
            { opacity: 0 },
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
export default TransitionFade;
