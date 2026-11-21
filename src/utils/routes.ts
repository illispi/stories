/** Typed path builder (replacement for routes-gen). */
export type RouteParams = {
	"/": Record<string, never>;
	"/admin/": Record<string, never>;
	"/admin/adminCrud": Record<string, never>;
	"/admin/fake": Record<string, never>;
	"/admin/sentry": Record<string, never>;
	"/admin/users": Record<string, never>;
	"/admin/notice": Record<string, never>;
	"/backup-restored": Record<string, never>;
	"/articles/": Record<string, never>;
	"/compare/": Record<string, never>;
	"/compare/:pOrT/:fOrT/compare": { pOrT: string; fOrT: string };
	"/explore/": Record<string, never>;
	"/explore/:pOrT/:fOrT": { pOrT: string; fOrT: string };
	"/login/": Record<string, never>;
	"/pollResults/": Record<string, never>;
	"/pollResults/:pOrT/:fOrT/pollResults": { pOrT: string; fOrT: string };
	"/questionares/": Record<string, never>;
	"/questionares/:personalQuestions": { personalQuestions: string };
	"/texts/:pOrT/:fOrT/:statsText": { pOrT: string; fOrT: string; statsText: string };
	"/user/data": Record<string, never>;
};

type Args = {
	[P in keyof RouteParams]: RouteParams[P] extends Record<string, never> ? [P] : [P, RouteParams[P]];
}[keyof RouteParams];

export function route(...args: Args): string {
	const [path, params] = args as [string, Record<string, string> | undefined];
	if (!params) return path;
	return path.replace(/:([A-Za-z]+)/g, (_, key: string) => encodeURIComponent(params[key] ?? ""));
}
