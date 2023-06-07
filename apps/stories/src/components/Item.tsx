import type { Component } from "solid-js";

export const Item: Component<{ name: string; value: string | number }> = (
  props
) => {
  return (
    <div class="my-3 flex flex-col items-center justify-center">
      <p class="mb-8 text-center text-xl underline underline-offset-8">
        {props.name}
      </p>
      <p class=" mb-4 rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
        {props.value}
      </p>
    </div>
  );
};
