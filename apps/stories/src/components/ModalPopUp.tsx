import { Presence, Motion } from "@motionone/solid";
import { createEffect, createSignal, ParentComponent, Setter } from "solid-js";
import { twMerge } from "tailwind-merge";

const ModalPopUp: ParentComponent<{
  message: string | null;
  customClasses?: string;
}> = (props) => {
  const [visible, setVisible] = createSignal(true);

  setTimeout(() => {
    setVisible(false);
  }, 3000);

  const classes = twMerge(
    "fixed top-2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl",
    props.customClasses
  );

  return (
    <Presence>
      {visible() && (
        <Motion.div
          class={classes}
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
