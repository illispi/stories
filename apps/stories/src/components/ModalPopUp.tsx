import { Presence, Motion } from "@motionone/solid";
import type { ParentComponent, Setter } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";

const ModalPopUp: ParentComponent<{
  message: string | null;
  customClasses?: string;
  setMessage: Setter<string | null>;
}> = (props) => {
  const classes = twMerge(
    "fixed top-2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl",
    props.customClasses
  );

  createEffect(() => {
    if (props.message) {
      setTimeout(() => {
        props.setMessage(null);
      }, 3000);
    }
  });

  return (
    <Presence>
      {props.message && (
        <Motion.div
          class="fixed top-16 left-1/2 -translate-x-1/2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <p>{props.message}</p>
        </Motion.div>
      )}
    </Presence>
  );
};

export default ModalPopUp;

//TODO maybe consider slightly over then back to position see tailwind keyframes
