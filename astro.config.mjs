// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import solid from "@astrojs/solid-js";

export default defineConfig({
	site: "https://poll.delvis.org",
	output: "server",
	adapter: node({ mode: "standalone" }),
	integrations: [solid()],
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
			PUBLIC_UMAMI_ID: envField.string({ context: "client", access: "public", optional: true }),
			PUBLIC_SENTRY_DSN: envField.string({
				context: "client",
				access: "public",
				default: "https://3a32bedf009e401cbf2249d2b82e97bb@glitchtip.delvis.org/1",
			}),
		},
	},
});
