import { HtmlHTMLAttributes } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  colors?: string;
}

const CustomButton = ({
  className,
  children,
  type,
  colors,
  ...rest
}: Props) => {
  return (
    <button
      type={type === undefined ? "button" : type}
      {...rest}
      className={`rounded-full p-3 font-semibold text-white
       transition-all active:scale-110 sm:hover:scale-110  ${className} ${
        colors
          ? colors
          : "bg-[#2c8f59] active:bg-[#4aa071] sm:hover:bg-[#4aa071]"
      } `}
    >
      {children}
    </button>
  );
};

export default CustomButton;
