import { Component, JSX, splitProps } from "solid-js";

const CustomButton: Component<{
  className?: string;
  type?: "button" | "submit" | "reset";
  rest?: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  children: JSX.Element;
}> = (props) => {
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
