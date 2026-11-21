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
# Sentry source maps (release builds): org/project/release are plain build args; the auth token
# is a BuildKit secret, so it's only visible to this RUN step and never stored in a layer.
# Without the secret the build skips the upload (and generates no source maps).
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_RELEASE
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
	SENTRY_ORG=$SENTRY_ORG SENTRY_PROJECT=$SENTRY_PROJECT SENTRY_RELEASE=$SENTRY_RELEASE \
	pnpm build

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
COPY package.json start.mjs ./
# Migrations run with Node's built-in TypeScript type stripping (no tsx needed)
COPY src/migrations ./src/migrations
COPY src/utils/migrate.ts ./src/utils/migrate.ts
USER node
EXPOSE 3000
# Applies pending migrations, then starts the server (see start.mjs)
CMD ["node", "start.mjs"]
