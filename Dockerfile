# syntax=docker/dockerfile:1

# Node 26 is the active LTS line (supported until April 2029).
# Node 25+ no longer bundles corepack, so pnpm is installed with npm.
FROM node:26-alpine AS base
RUN npm install --global pnpm@11
WORKDIR /app

# All dependencies, for building
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# Public values are baked into the client bundle at build time.
# Secrets (PSQL_*, BETTER_AUTH_*, DISCORD_*) are read at runtime and never belong here.
ARG PUBLIC_SITE=https://poll.delvis.org
ARG PUBLIC_CF_ANALYTICS_TOKEN
ARG PUBLIC_SENTRY_DSN
ENV PUBLIC_SITE=$PUBLIC_SITE \
	PUBLIC_CF_ANALYTICS_TOKEN=$PUBLIC_CF_ANALYTICS_TOKEN \
	PUBLIC_SENTRY_DSN=$PUBLIC_SENTRY_DSN
RUN pnpm build

# Production dependencies only
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json entrypoint.sh ./
# Migrations run with Node's built-in TypeScript type stripping (no tsx needed)
COPY src/migrations ./src/migrations
COPY src/utils/migrate.ts ./src/utils/migrate.ts
RUN chmod +x entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
