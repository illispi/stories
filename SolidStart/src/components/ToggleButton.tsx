import type { JSX, Component } from "solid-js";
import CustomButton from "./CustomButton";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  toggled?: boolean;
}
const ToggleButton: Component<Props> = (props) => {
  return (
    <CustomButton
      onClick={(e) => props.onClick(e)}
      class={
        props.toggled
          ? `bg-blue-800 hover:bg-blue-900 active:bg-blue-900 focus:bg-blue-900`
          : ""
      }
    >
      {props.children}
    </CustomButton>
  );
};

export default ToggleButton;
