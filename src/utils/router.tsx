/**
 * Small stand-ins for the @solidjs/router / @solidjs/meta APIs the components use.
 * Navigation itself is done by Astro's <ClientRouter /> (view transitions).
 */
import { type JSX, type ParentComponent, createContext, createEffect, createSignal, onMount, splitProps, useContext } from "solid-js";

const isBrowser = typeof window !== "undefined";

const go = async (to: string, replace = false) => {
	const { navigate } = await import("astro:transitions/client");
	return navigate(to, { history: replace ? "replace" : "auto" });
};

export const A: ParentComponent<
	JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; activeClass?: string; end?: boolean }
> = (props) => {
	const [, rest] = splitProps(props, ["activeClass", "end"]);
	return <a {...rest} />;
};

export const useNavigate =
	() =>
	(to: string | number, options?: { replace?: boolean }) =>
		typeof to === "number" ? history.go(to) : go(to, options?.replace);

export const Navigate = (props: { href: string }) => {
	onMount(() => go(props.href, true));
	return null;
};

/** Route params, provided per island by withProviders (from Astro.params). */
export const ParamsContext = createContext<Record<string, string | undefined>>({});
export const useParams = <T extends Record<string, string | undefined>>() =>
	useContext(ParamsContext) as T;

const [search, setSearch] = createSignal(isBrowser ? location.search : "");
if (isBrowser) {
	const sync = () => setSearch(location.search);
	window.addEventListener("popstate", sync);
	document.addEventListener("astro:after-swap", sync);
}

type SearchValue = string | number | boolean | null | undefined;

export const useSearchParams = <T extends Record<string, string | undefined>>() => {
	const params = new Proxy({} as T, {
		get: (_, key) => new URLSearchParams(search()).get(String(key)) ?? undefined,
	});
	const set = (next: Record<string, SearchValue>) => {
		const url = new URL(location.href);
		for (const [key, value] of Object.entries(next)) {
			if (value === null || value === undefined || value === "") url.searchParams.delete(key);
			else url.searchParams.set(key, String(value));
		}
		// replaceState keeps Astro's history state intact (pushState would confuse ClientRouter)
		history.replaceState(history.state, "", url);
		setSearch(url.search);
	};
	return [params, set] as const;
};

export const useLocation = () => ({
	get pathname() {
		search();
		return isBrowser ? location.pathname : "/";
	},
	get search() {
		return search();
	},
});

export const useIsRouting = () => () => false;

/** Sets document.title (replacement for @solidjs/meta's <Title>). */
export const Title = (props: { children: string }) => {
	createEffect(() => {
		document.title = props.children;
	});
	return null;
};
