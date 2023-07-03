import { Presence, Motion } from "@motionone/solid";
import type { ParentComponent, Setter } from "solid-js";
import { Show, createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";

const ModalPopUp: ParentComponent<{
  message: string | null;
  class?: string;
  setMessage: Setter<string | null>;
}> = (props) => {
  const classes = twMerge(
    "absolute top-24 left-1/2 -translate-x-1/2 rounded-3xl border-2 border-red-400 bg-red-100 p-8 text-center shadow-xl",
    props.class
  );

  createEffect(() => {
    if (props.message) {
      setTimeout(() => {
        props.setMessage(null);
      }, 3000);
    }
  });

  return (
    <Portal>
      <Presence>
        <Show when={props.message}>
          <Motion.div
            class={classes}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p>{props.message}</p>
          </Motion.div>
        </Show>
      </Presence>
    </Portal>
  );
};

export default ModalPopUp;

//TODO maybe consider slightly over then back to position see tailwind keyframes
