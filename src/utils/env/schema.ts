import { z } from "zod";

export const serverScheme = z.object({
	PSQL_PASSWORD: z.string(),
	PSQL_USERNAME: z.string(),
	DATABASE_URL: z.string(),
	SESSSION_SECRET: z.string(),
	AUTH_SECRET: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	PSQL_DATABASE: z.enum(["stories", "stories_dev"]),
	PSQL_HOST: z.string(),
});

export const clientScheme = z.object({
	PUBLIC_NODE_ENV: z.enum(["development", "production"]),
	PUBLIC_GITHUB_CLIENT_ID: z.string(),
	PUBLIC_AUTH_TRUST_HOST: z.enum(["true", "false"]),
	PUBLIC_AUTH_URL: z.string().url(),
	PUBLIC_DISCORD_CLIENT_ID: z.string(),
	PUBLIC_SITE: z.string(),
});
