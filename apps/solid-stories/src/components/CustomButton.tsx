import { Component, JSX, ParentComponent, splitProps } from "solid-js";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  type?: "button" | "submit" | "reset";
}
const CustomButton: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, ["className", "type"]);
  return (
    <button
      type={local.type === undefined ? "button" : local.type}
      class={`rounded-full p-3 m-2 font-semibold text-white
      transition-all active:scale-110 hover:scale-110 bg-blue-500 active:bg-blue-600 hover:bg-blue-600`}
      {...others}
    >
      {props.children}
    </button>
  );
};

export default CustomButton;
