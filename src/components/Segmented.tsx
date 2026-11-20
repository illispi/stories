import { For, Show } from "solid-js";

/** Pill-shaped radio group: one option is always selected. */
export default function Segmented<T extends string>(props: {
	label: string;
	options: [T, string][];
	value: T;
	onChange: (value: T) => void;
	/** Optional red count badge per option, shown when above 0. */
	badges?: Partial<Record<T, number>>;
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
						class="relative rounded-full px-4 py-1.5 font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						classList={{
							"bg-blue-800 text-white shadow-sm": props.value === value,
							"text-slate-700 hover:bg-white": props.value !== value,
						}}
						onClick={() => props.onChange(value)}
					>
						{text}
						<Show when={(props.badges?.[value] ?? 0) > 0}>
							<span
								class="-top-2 -right-1 absolute min-w-5 rounded-full bg-red-600 px-1 text-center font-bold text-white text-xs leading-5 ring-2 ring-white"
								aria-label={`${props.badges?.[value]} pending`}
							>
								{(props.badges?.[value] ?? 0) > 99 ? "99+" : props.badges?.[value]}
							</span>
						</Show>
					</button>
				)}
			</For>
		</div>
	);
}
