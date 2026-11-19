/**
 * tRPC 11 + @tanstack/solid-query, exposed with the same call shape the components
 * used with @solid-mediakit/trpc:
 *   trpc.x.createQuery(() => input, () => options)
 *   trpc.x.createMutation(() => options)
 *   trpc.useContext().invalidate() / trpc.useContext().x.invalidate()
 */
import {
	type CreateMutationResult,
	type CreateQueryResult,
	QueryClient,
	createMutation,
	createQuery,
} from "@tanstack/solid-query";
import { type TRPCClientErrorLike, createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { IAppRouter } from "~/server/trpc/router/trpcRouters";
import { authClient } from "./auth-client";

type Inputs = inferRouterInputs<IAppRouter>;
type Outputs = inferRouterOutputs<IAppRouter>;
type Err = TRPCClientErrorLike<IAppRouter>;
// Extra solid-query options. The common ones are typed; anything else passes through.
type QueryExtra<K extends keyof Outputs> = {
	placeholderData?: Outputs[K] | null | ((prev: Outputs[K] | undefined) => Outputs[K] | undefined);
	enabled?: boolean;
	[option: string]: unknown;
};
type MutationExtra<K extends keyof Outputs> = {
	onSuccess?: (data: Outputs[K], variables: Inputs[K]) => unknown;
	onError?: (error: Err, variables: Inputs[K]) => unknown;
	onSettled?: () => unknown;
	[option: string]: unknown;
};
type Extra = Record<string, unknown>;

type ProcedureShim<K extends keyof Outputs> = {
	createQuery(
		input?: () => Inputs[K] | undefined,
		options?: () => QueryExtra<K>,
	): CreateQueryResult<Outputs[K], Err>;
	createMutation(options?: () => MutationExtra<K>): CreateMutationResult<Outputs[K], Err, Inputs[K]>;
};

type Invalidator = { invalidate(): Promise<void> };
type TrpcShim = { [K in keyof Outputs]: ProcedureShim<K> } & {
	useContext(): Invalidator & { [K in keyof Outputs]: Invalidator };
	/** Pseudo-procedure: signs out through Better Auth */
	logOut: { createMutation(options?: () => Extra): CreateMutationResult<unknown, Error, void> };
};

export const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
});

export const client = createTRPCClient<IAppRouter>({
	links: [httpBatchLink({ url: "/api/trpc" })],
});

const call = (path: string, kind: "query" | "mutate", input: unknown) =>
	// biome-ignore lint/suspicious/noExplicitAny: dynamic procedure lookup
	(client as any)[path][kind](input);

const procedure = (path: string) => ({
	createQuery: (input?: () => unknown, options?: () => Extra) =>
		createQuery(() => {
			const value = input?.();
			return {
				queryKey: [path, value ?? null],
				queryFn: () => call(path, "query", value),
				...(options?.() ?? {}),
			};
		}, () => queryClient),
	createMutation: (options?: () => Extra) =>
		createMutation(
			() => ({
				mutationFn: (value: unknown) =>
					path === "logOut"
						? authClient.signOut().then(() => null)
						: call(path, "mutate", value),
				...(options?.() ?? {}),
			}),
			() => queryClient,
		),
});

const useContext = () =>
	new Proxy(
		{ invalidate: () => queryClient.invalidateQueries() },
		{
			get: (target, path) =>
				path === "invalidate"
					? target.invalidate
					: { invalidate: () => queryClient.invalidateQueries({ queryKey: [path] }) },
		},
	);

export const trpc = new Proxy({} as TrpcShim, {
	get: (_, path) => (path === "useContext" ? useContext : procedure(String(path))),
});
