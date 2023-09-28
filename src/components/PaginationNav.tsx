import { Component, Setter } from "solid-js";
import CustomButton from "./CustomButton";

const PaginationNav: Component<{
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
        class={props.page === 0 ? "invisible" : props.classButton}
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
        class={
          props.arrLength / ((props.page + 1) * props.perPageNum) <= 1
            ? "invisible"
            : props.classButton
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
