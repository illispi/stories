# Stories: schizophrenia poll

User poll and shared articles about schizophrenia, live at <https://poll.delvis.org>.

## Stack

- [Astro](https://astro.build) 7 (server output, `@astrojs/node` standalone) with [Solid](https://www.solidjs.com) islands
- [Better Auth](https://better-auth.com): Discord sign-in only, no passwords; only the Discord account ID is stored
- [tRPC](https://trpc.io) 11 + TanStack Solid Query for the API (`/api/trpc`)
- PostgreSQL via [Kysely](https://kysely.dev); migrations in `src/migrations`
- Tailwind CSS 3, Apache ECharts 6 for charts (SVG renderer, tree-shaken in `src/utils/echarts.ts`)
- Error reporting: [`@sentry/astro`](https://docs.sentry.io/platforms/javascript/guides/astro/) (browser + server, production only) to Sentry; set up in `sentry.client.config.ts` / `sentry.server.config.ts`, DSN from `PUBLIC_SENTRY_DSN`
- Node.js 26, pnpm 11

## Local development

Requirements: Node.js 26+, pnpm 11, Docker (for Postgres).

```sh
# 1. Postgres
docker run -d --name stories-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=stories -p 127.0.0.1:5432:5432 -v stories-pgdata:/var/lib/postgresql/data postgres:17-alpine

# 2. Config: copy and fill in (Discord client ID/secret, DB password)
cp .env.example .env

# 3. Install, migrate, run
pnpm install
pnpm migrate:latest
pnpm dev            # http://localhost:4321
```

Discord OAuth app: add `http://localhost:4321/api/auth/callback/discord` (dev) and
`https://poll.delvis.org/api/auth/callback/discord` (prod) as redirects, scope `identify` only.

Make yourself admin after the first sign-in:

```sql
UPDATE auth_user SET role = 'admin' WHERE id = '<your user id>';
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm check` | Type-check (`astro check`) |
| `pnpm build` / `pnpm start` | Production build / apply pending migrations, then run the server (`start.mjs`) |
| `pnpm serve` | Run the built server without migrating |
| `pnpm migrate:latest` / `pnpm migrate:down` | Apply all / roll back one migration |
| `pnpm new:migration <name>` | Create an empty migration file |
| `pnpm sql-types` | Regenerate `src/types/db.ts` from the database (uses `DATABASE_URL`) |

## Project layout

```
src/
  pages/        Astro routes (.astro pages, /api/auth, /api/trpc)
  views/        Page-level Solid components (mounted as islands)
  components/   Shared Solid components
  islands/      Island wrappers (providers, navbar)
  layouts/      Base layout (navbar, footer, Cloudflare Web Analytics)
  server/       DB, Better Auth, tRPC routers, param validation
  middleware.ts Session -> Astro.locals, protected routes, CSRF check for tRPC
  migrations/   Kysely migrations (run by Node's built-in TypeScript support)
  utils/        tRPC client shim, router helpers, auth client
```

## Deployment

Pull requests and pushes to `main` run the checks in `.github/workflows/deploy.yml` (audit,
type-check, build) and build the Docker image without pushing it, so a broken Dockerfile
shows up before a release. A release is made by pushing a version tag:

```sh
git tag v1.0.0
git push origin v1.0.0
```

That runs the checks again, then builds and pushes `illispi/stories:1.0.0`, `:1.0` and
`:latest` to Docker Hub. A pre-release tag such as `v1.1.0-rc.1` is pushed only as
`:1.1.0-rc.1` (never `latest`). The container runs pending migrations on start, then serves on
port 3000.

Without Docker (plain Node 26 on the server, no pnpm needed there):

```sh
node --env-file=.env start.mjs
```

`start.mjs` applies pending migrations first (with the `PSQL_*` values from the environment
or `.env`) and starts the server only if they succeed. On the server it needs `dist/`,
`node_modules/` (production dependencies), `package.json`, `start.mjs`, `src/migrations/`
and `src/utils/migrate.ts`. Kysely locks the migration table, so several instances starting
at once is safe.

Runtime environment variables (set on the server, never in the image):
`PSQL_HOST`, `PSQL_PORT`, `PSQL_DATABASE`, `PSQL_USERNAME`, `PSQL_PASSWORD`,
`BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL=https://poll.delvis.org`,
`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.

Readable Sentry stack traces (source maps), uploaded by release builds only:

1. In Sentry: Settings → Developer Settings → Organization Tokens → create a token (it gets
   the scopes needed for source map uploads).
2. In GitHub (Settings → Secrets and variables → Actions): secret `SENTRY_AUTH_TOKEN` with
   that token, and variables `SENTRY_ORG` and `SENTRY_PROJECT` with the org and project slugs
   (as in the Sentry URL).

The token reaches the Docker build as a BuildKit secret, so it never ends up in the image.
The `.map` files are deleted after the upload and are never served. Each upload is labelled
with the version tag (e.g. `v1.0.0`) as the Sentry release. Without the token, builds skip the
upload and generate no source maps.

The workflow's actions are referenced by version tag. To pin them to commit SHAs (so a moved
or compromised tag can't change what runs), run this once in the repository and commit the
result; Dependabot (`.github/dependabot.yml`) then keeps the SHAs up to date:

```sh
npx pin-github-action .github/workflows/deploy.yml
```

The `DOCKERHUB_TOKEN` secret should be a Docker Hub access token with read & write access to
the `illispi/stories` repository only.

Error reporting: set the GitHub Actions variable `PUBLIC_SENTRY_DSN` (repository →
Settings → Secrets and variables → Actions → Variables) to the Sentry project's DSN; it's
baked in at build time. Without it nothing is reported. In the Sentry project, turn on
Settings → Security & Privacy → "Prevent Storing of IP Addresses", which the privacy notice
relies on.

Put the app behind Cloudflare only (Tunnel or a firewall that allows only Cloudflare IPs):
rate limiting is done with Cloudflare WAF rules, and the app stores no IP addresses.
The reverse proxy must forward `X-Forwarded-Proto`.

See `upgrade guide.md` for the history of the 2026 migration from SolidStart.
