import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { A } from "solid-start";

import type { MainReturn } from "~/types/types";
import type { PersonalQuestions } from "~/types/zodFromTypes";

export const TextComponent: Component<{
  header: string;
  stat: keyof PersonalQuestions;
  data: MainReturn | undefined;
}> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center ">
      <Show when={props.data?.[props.stat]}>
        <Show
          when={props.data?.[props.stat].length > 0}
          fallback={<div>failure</div>}
        >
          <div class="flex w-11/12 max-w-xs flex-col items-center justify-center ">
            <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
            <For each={props.data?.[props.stat]}>
              {(stat, i) => (
                <div class="flex w-full max-w-xs flex-col items-center justify-center">
                  <h5 class="m-2 font-bold">{i() + 1}.</h5>
                  <p class="w-full md:w-[400px] lg:w-[460px]">{stat}</p>
                </div>
              )}
            </For>

            <A href={`/stats/texts/${props.stat}`}>
              <div
                class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
        text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
              >
                Show more
              </div>
            </A>
          </div>
        </Show>
      </Show>
    </div>
  );
};

//TODO make text field wider on pc responsively not with this current one
