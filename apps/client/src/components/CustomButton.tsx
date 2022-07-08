import { HtmlHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
}

const CustomButton = ({
  className,
  children,
  type,

  ...rest
}: Props) => {
  const classNameBase = twMerge(
    `rounded-full p-3 m-2 font-semibold text-white
      transition-all active:scale-110 hover:scale-110 bg-blue-500 active:bg-blue-600 hover:bg-blue-600`,
    className
  );
  return (
    <button
      type={type === undefined ? "button" : type}
      {...rest}
      className={classNameBase}
    >
      {children}
    </button>
  );
};

export default CustomButton;
