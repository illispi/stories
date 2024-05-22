import type { Component, Setter } from "solid-js";
import CustomButton from "./CustomButton";
import { twMerge } from "tailwind-merge";

const PaginationNav: Component<{
	classButton?: string;
	dirSetter: Setter<number>;
	nextOnClick?: () => void;
	backOnClick?: () => void;
	page: number;
	arrLength: number;
	setPage: Setter<number>;
	perPageNum: number;
}> = (props) => {
	const pageMax =
		props.arrLength % props.perPageNum === 0
			? Math.floor(props.arrLength / props.perPageNum)
			: Math.floor(props.arrLength / props.perPageNum) + 1;
	return (
		<>
			<CustomButton
				class={twMerge(
					"visible opacity-100 transition-all duration-300",
					`${
						props.page === 0
							? "bg-gray-500 active:bg-gray-600 focus:bg-gray-600 hover:bg-gray-600"
							: props.classButton
					}`,
				)}
				onClick={() => {
					props.dirSetter(-1);
					props.setPage((prev) => (prev === 0 ? 0 : prev - 1));
					props.backOnClick ? props.backOnClick() : null;
				}}
			>
				Back
			</CustomButton>
			<h5 class="font-bold text-lg">{`Page: ${props.page + 1}/${pageMax}`}</h5>
			<CustomButton
				class={twMerge(
					"visible opacity-100 transition-all duration-300",
					`${
						props.arrLength / ((props.page + 1) * props.perPageNum) <= 1
							? "bg-gray-500 active:bg-gray-600 focus:bg-gray-600 hover:bg-gray-600"
							: props.classButton
					}`,
				)}
				onClick={() => {
					props.dirSetter(1);
					props.setPage((prev) =>
						props.arrLength / ((prev + 1) * props.perPageNum) <= 1
							? prev
							: prev + 1,
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
