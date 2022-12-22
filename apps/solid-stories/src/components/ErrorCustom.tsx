import { Presence, Motion } from "@motionone/solid";
import { createEffect, ParentComponent, Setter } from "solid-js";

const ErrorCustom: ParentComponent<{
  message: string | null;
  setError: Setter<string | null>;
}> = (props) => {
  createEffect(() => {
    if (props.message) {
      setTimeout(() => {
        props.setError(null);
      }, 3000);
    }
  });

  return (
    <Presence>
      {props.message && (
        <Motion.div
          class="fixed top-2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl"
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

export default ErrorCustom;
