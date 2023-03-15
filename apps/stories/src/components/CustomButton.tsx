import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  classChange?: string | null;
  type?: "button" | "submit" | "reset";
}
const CustomButton: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, ["classChange", "type"]);

  return (
    <button
      type={local.type === undefined ? "button" : local.type}
      class={`m-2 rounded-full p-3 font-semibold
      text-white transition-all hover:scale-110  active:scale-110  ${
        local.classChange ?? "bg-blue-500 hover:bg-blue-600 active:bg-blue-600"
      }`}
      {...others}
    >
      {props.children}
    </button>
  );
};

export default CustomButton;
