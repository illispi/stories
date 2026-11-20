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
| `pnpm build` / `pnpm start` | Production build / run `dist/server/entry.mjs` |
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

Pull requests and pushes to `main` only run the checks in `.github/workflows/deploy.yml`
(audit, type-check, build). A release is made by pushing a version tag:

```sh
git tag v1.0.0
git push origin v1.0.0
```

That runs the checks again, then builds and pushes `illispi/stories:1.0.0`, `:1.0` and
`:latest` to Docker Hub. The container runs pending migrations on start, then serves on
port 3000.

Runtime environment variables (set on the server, never in the image):
`PSQL_HOST`, `PSQL_PORT`, `PSQL_DATABASE`, `PSQL_USERNAME`, `PSQL_PASSWORD`,
`BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL=https://poll.delvis.org`,
`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.

Error reporting: set the GitHub Actions variable `PUBLIC_SENTRY_DSN` (repository →
Settings → Secrets and variables → Actions → Variables) to the Sentry project's DSN; it's
baked in at build time. Without it nothing is reported. In the Sentry project, turn on
Settings → Security & Privacy → "Prevent Storing of IP Addresses", which the privacy notice
relies on.

Put the app behind Cloudflare only (Tunnel or a firewall that allows only Cloudflare IPs):
rate limiting is done with Cloudflare WAF rules, and the app stores no IP addresses.
The reverse proxy must forward `X-Forwarded-Proto`.

See `upgrade guide.md` for the history of the 2026 migration from SolidStart.
