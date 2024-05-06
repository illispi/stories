import { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionFade: ParentComponent = (props) => {
  return (
    <Transition name="fade" mode="outin">
      {props.children}
    </Transition>
  );
};
export default TransitionFade;
