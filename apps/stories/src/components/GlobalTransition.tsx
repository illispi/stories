import { resolveFirst } from "@solid-primitives/refs";
import { createSwitchTransition } from "@solid-primitives/transition-group";
import { Component, ParentProps } from "solid-js";

const GlobalTransition: Component<ParentProps> = (props) => {
  const el = resolveFirst(
    () => props.children,
    (item): item is HTMLElement => item instanceof HTMLElement
  );

  const animateIn = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) return done();
    el.animate(
      [
        { opacity: 0, transform: "translate(100px)",easing: "ease-out" },
        { opacity: 1, transform: "translate(0)", easing: "ease-in" },
      ],
      { duration: 400 }
    )
      .finished.then(done)
      .catch(done);
  };

  const animateOut = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) return done();

    el.animate(
      [
        { opacity: 1, transform: `translate(0)` },
        { opacity: 0, transform: "translate(-100px)" },
      ],
      { duration: 400 }
    )
      .finished.then(done)
      .catch(done);
  };

  const transition = createSwitchTransition(el, {
    onEnter(el, done) {
      queueMicrotask(() => animateIn(el, done));
    },
    onExit(el, done) {
      animateOut(el, done);
    },
    mode: "out-in",
  });

  return <>{transition()}</>;
};

export default GlobalTransition;
