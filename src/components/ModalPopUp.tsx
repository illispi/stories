import type { Component, ParentComponent, ParentProps, Setter } from "solid-js";
import { Show, createEffect } from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { createSwitchTransition } from "@solid-primitives/transition-group";
import { resolveFirst } from "@solid-primitives/refs";

const Transition: Component<ParentProps> = (props) => {
  const el = resolveFirst(() => props.children);

  const rendered = createSwitchTransition(el, {
    onEnter(el, done) {
      // the enter callback is called before the element is inserted into the DOM
      // so run the animation in the next animation frame / microtask
      queueMicrotask(() => {
        if (!el.isConnected) return done();

        el.animate(
          [
            {
              opacity: 0,
              transform: "translate(-50%, -100px)",
              easing: "ease-out",
            },
            {
              opacity: 1,
              transform: "translate(-50%, 5px)",
              easing: "ease-in-out",
            },
            { opacity: 1, transform: `translate(-50%, 0)` },
          ],
          { duration: 300 }
        )
          .finished.then(done)
          .catch(done);
        /*...*/
      });
    },
    onExit(el, done) {
      if (!el.isConnected) return done();

      el.animate(
        [
          { opacity: 1, transform: `translate(-50%, 0)`, easing: "ease-in" },
          {
            opacity: 0,
            transform: "translate(-50%, -100px)",
          },
        ],
        { duration: 300 }
      )
        .finished.then(done)
        .catch(done);
      /*...*/
    },
  });

  return <>{rendered()}</>;
};

const ModalPopUp: ParentComponent<{
  message: string | null;
  class?: string;
  setMessage: Setter<string | null>;
}> = (props) => {
  createEffect(() => {
    if (props.message) {
      setTimeout(() => {
        props.setMessage(null);
      }, 3000);
    }
  });

  return (
    <Portal>
      <Transition>
        <Show when={props.message}>
          <div
            class={twMerge(
              "-translate-x-1/2 fixed top-16 left-1/2 z-50 w-64 rounded-3xl border-2 border-red-400 bg-red-100 p-8 text-center text-lg shadow-xl",
              props.class
            )}
          >
            <p>{props.message}</p>
          </div>
        </Show>
      </Transition>
    </Portal>
  );
};

export default ModalPopUp;

//TODO maybe consider slightly over then back to position see tailwind keyframes
//TODO remove this primitive in favor of solid-transition-group
