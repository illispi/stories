import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

function optional_in_dev<T extends z.ZodTypeAny>(
	schema: T,
): z.ZodOptional<T> | T {
	return process.env.NODE_ENV === "development" ? schema.optional() : schema;
}

export const env = createEnv({
	server: {
		PSQL_PASSWORD: z.string(),
		PSQL_USERNAME: z.string(),
		SESSSION_SECRET: z.string(),
		AUTH_SECRET: z.string(),
		AUTH_TRUST_HOST: z.string(),
		DISCORD_CLIENT_SECRET: z.string(),
		DATABASE_URL: z.string(),
		PSQL_HOST: z.string(),
		PSQL_DATABASE: z.string(),
		NODE_ENV: z.enum(["development", "production"]).default("development"),
	},
	clientPrefix: "VITE_",

	client: {
		VITE_SITE: z.string(),
		VITE_AUTH_URL: z.string(),
		VITE_DISCORD_CLIENT_ID: z.string(),
	},
	// We need to manually list the env's for the frontend bundle
	runtimeEnv: { ...process.env, ...import.meta.env },
	skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
	emptyStringAsUndefined: true,
});
