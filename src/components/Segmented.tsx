import { For } from "solid-js";

/** Pill-shaped radio group: one option is always selected. */
export default function Segmented<T extends string>(props: {
	label: string;
	options: [T, string][];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={props.label}
			class="inline-flex flex-wrap justify-center rounded-full bg-slate-100 p-1 ring-1 ring-slate-200"
		>
			<For each={props.options}>
				{([value, text]) => (
					<button
						type="button"
						role="radio"
						aria-checked={props.value === value}
						class="rounded-full px-4 py-1.5 font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						classList={{
							"bg-blue-800 text-white shadow-sm": props.value === value,
							"text-slate-700 hover:bg-white": props.value !== value,
						}}
						onClick={() => props.onChange(value)}
					>
						{text}
					</button>
				)}
			</For>
		</div>
	);
}
