import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  class?: string;
  type?: "button" | "submit" | "reset";
  color?:
    | "slate"
    | "gray"
    | "zinc"
    | "neutral"
    | "stone"
    | "red"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose";
}
const CustomButton: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, ["class", "type"]);

  return (
    <button
      type={local.type === undefined ? "button" : local.type}
      class={twMerge(
        `m-2 rounded-full p-3 font-semibold text-white transition-all hover:scale-110 active:scale-125 duration-200 ease-in bg-${
          props.color ?? "blue"
        }-500 hover:bg-${props.color ?? "blue"}-600 focus:bg-${
          props.color ?? "blue"
        }-600 active:bg-${props.color ?? "blue"}-600`,
        local.class
      )}
      {...others}
    >
      {props.children}
    </button>
  );
};

export default CustomButton;
