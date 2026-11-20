// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import solid from "@astrojs/solid-js";
import sentry from "@sentry/astro";

export default defineConfig({
	site: "https://poll.delvis.org",
	output: "server",
	adapter: node({ mode: "standalone" }),
	// Error reporting: sentry.client.config.ts / sentry.server.config.ts; the server middleware
	// for request errors is added automatically. Source maps are uploaded to Sentry only when a
	// build has SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT set (e.g. in CI).
	integrations: [
		solid(),
		sentry({
			sourceMapsUploadOptions: {
				enabled: Boolean(process.env.SENTRY_AUTH_TOKEN),
				authToken: process.env.SENTRY_AUTH_TOKEN,
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
			},
		}),
	],
	security: { checkOrigin: true },
	server: { port: 4321 },
	env: {
		schema: {
			PSQL_HOST: envField.string({ context: "server", access: "secret" }),
			PSQL_DATABASE: envField.string({ context: "server", access: "secret" }),
			PSQL_USERNAME: envField.string({ context: "server", access: "secret" }),
			PSQL_PASSWORD: envField.string({ context: "server", access: "secret" }),
			PSQL_PORT: envField.number({ context: "server", access: "secret", default: 5432 }),
			BETTER_AUTH_SECRET: envField.string({ context: "server", access: "secret" }),
			BETTER_AUTH_URL: envField.string({ context: "server", access: "secret" }),
			DISCORD_CLIENT_ID: envField.string({ context: "server", access: "secret" }),
			DISCORD_CLIENT_SECRET: envField.string({ context: "server", access: "secret" }),
			PUBLIC_SITE: envField.string({ context: "client", access: "public", default: "https://poll.delvis.org" }),
			// Cloudflare Web Analytics site token (from the JS snippet); without it no analytics
			PUBLIC_CF_ANALYTICS_TOKEN: envField.string({ context: "client", access: "public", optional: true }),
			// The Sentry project's DSN; without it nothing is reported
			PUBLIC_SENTRY_DSN: envField.string({ context: "client", access: "public", optional: true }),
		},
	},
});
