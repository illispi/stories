import { Component, Setter } from "solid-js";
import CustomButton from "./CustomButton";

const PaginationNav: Component<{
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
  classButton?: string;
  backOnClick?: () => void;
  nextOnClick?: () => void;
  page: number;
  arrLength: number;
  setPage: Setter<number>;
  perPageNum: number;
}> = (props) => {
  return (
    <>
      <CustomButton
        color={props.color}
        class={props.page === 0 ? "invisible" : ""}
        onClick={() => {
          props.setPage((prev) => (prev === 0 ? 0 : prev - 1));
          props.backOnClick ? props.backOnClick() : null;
        }}
      >
        Back
      </CustomButton>
      <h5 class="text-lg font-bold">{`Page: ${props.page + 1}/${
        Math.floor(props.arrLength / props.perPageNum) + 1
      }`}</h5>

      <CustomButton
        color={props.color}
        class={
          props.arrLength / ((props.page + 1) * props.perPageNum) <= 1
            ? "invisible"
            : ""
        }
        onClick={() => {
          props.setPage((prev) =>
            props.arrLength / ((prev + 1) * props.perPageNum) <= 1
              ? prev
              : prev + 1
          );
          props.nextOnClick ? props.nextOnClick() : null;
        }}
      >
        Next
      </CustomButton>
    </>
  );
};

export default PaginationNav;
