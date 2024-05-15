import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		PSQL_PASSWORD: z.string(),
		PSQL_USERNAME: z.string(),
		DATABASE_URL: z.string(),
		SESSSION_SECRET: z.string(),
		AUTH_SECRET: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		DISCORD_CLIENT_SECRET: z.string(),
		PSQL_DATABASE: z.enum(["stories", "stories_dev"]),
		PSQL_HOST: z.string()
	},
	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
	 */
	client: {
		PUBLIC_NODE_ENV: z.enum(["development", "production"]),
		PUBLIC_GITHUB_CLIENT_ID: z.string(),
		PUBLIC_AUTH_TRUST_HOST: z.boolean(),
		PUBLIC_AUTH_URL: z.string().url(),
		PUBLIC_DISCORD_CLIENT_ID: z.string(),
		PUBLIC_SITE: z.string().url(),
	},
	/*
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: import.meta.env,
	clientPrefix: "PUBLIC_",
});
