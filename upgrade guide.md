# Upgrade guide: SolidStart (vinxi) → Astro + Solid islands, Better Auth (OAuth only), dependency security pass

Written 2026-11-19 against the repo as of commit `02dda4f`.
Section 2 is based on `audit.json` (`pnpm audit --json`, run 2026-11-19).

This guide covers four things that are done together:

1. **Move the framework** from `@solidjs/start` 1.0.9 / `vinxi` 0.4.3 to **Astro 7** with `@astrojs/solid-js` and `@astrojs/node`.
2. **Fix the 184 advisories** reported by `pnpm audit`. Most come from vinxi/SolidStart and disappear with them; the rest need explicit bumps.
3. **Replace the custom username/password auth** (Lucia v3 + oslo + Argon2, both deprecated) with **Better Auth, Discord login only**. There will be no passwords in the app anymore. The app starts on a **brand-new database**, so there are no existing users or sessions to migrate.
4. Fix a few security issues in the app code found during review.

---

## 0. TL;DR checklist

- [ ] Create branch `astro-migration`
- [ ] Node ≥ 22.12 locally, in Docker and in CI
- [ ] Register Discord OAuth app redirects for dev and prod (§4.1)
- [ ] Put the origin behind Cloudflare only (Tunnel or firewall allowlist) and add WAF rate-limit rules (§4.7)
- [ ] Phase 1: scaffold Astro next to the existing `src/`
- [ ] Phase 2: server side — Kysely 0.28, tRPC 11, valibot 1
- [ ] Phase 3: Better Auth + rewritten auth migration + middleware
- [ ] Phase 4: port routes to `src/pages/*.astro` with Solid islands
- [ ] Phase 5: replace SolidStart/Solid Router APIs in components
- [ ] Phase 6: images, Sentry, Umami, env, Tailwind 4
- [ ] Phase 7: Docker + GitHub Actions
- [ ] Phase 8: remove old deps; `pnpm audit` clean; smoke test every route

---

## 1. Current state

| Area | Now | Notes |
|---|---|---|
| Framework | `@solidjs/start` 1.0.9 on `vinxi` 0.4.3 | `ssr: false` in `app.config.ts` → effectively a client-rendered SPA plus an API server |
| Routing | `@solidjs/router` 0.14 file routes, `routes-gen` for typed paths | Route groups like `(login).tsx`, dynamic `[pOrT]/[fOrT]` |
| Transitions | Custom `VtApi.tsx` (`useBeforeLeave` + `document.startViewTransition`) | |
| API | tRPC **10.45.2** via `@solid-mediakit/trpc` 3.0.3, at `/api/trpc` | 31 procedures in `trpcRouters.ts` |
| Data fetching | `@tanstack/solid-query` 5.59, `suspense: true` | |
| DB | `kysely` **0.27.4**, `pg` 8.13, `kysely-codegen` 0.17 | |
| Auth | Username + password: `lucia` 3.2.2, `@lucia-auth/adapter-postgresql`, `oslo` Argon2id; tables `auth_user`, `user_session` | Lucia v3 and oslo are **deprecated**. `/login/github` is linked but not implemented |
| Validation | `valibot` 0.42 (+ `@typeschema/valibot`), `zod` 3 | Login form still uses the pre-0.31 valibot API |
| Images | `vite-imagetools` | |
| Styling | Tailwind 3.4 + PostCSS | |
| Monitoring | `@sentry/browser` 8 → GlitchTip, Umami script | |
| Deploy | Docker `node:22-alpine`, builds **at container start** (`entrypoint.sh`) | |

---

## 2. `pnpm audit` results (audit.json)

**Totals:** 4 critical, 96 high, 62 moderate, 22 low (184 advisories in 42 packages; 896 dependencies).

### 2.1 Critical

| Package | Installed | Advisory | Fixed | Comes from | Action |
|---|---|---|---|---|---|
| `seroval` | 1.1.1 | GHSA-mv8w-475r-vwqw, GHSA-p6vx-979v-rg4c — `fromJSON()` deserialization invokes attacker-controlled code (plus 8 more high: RCE, prototype pollution, DoS) | **1.6.8** (covers all 10) | `solid-js` and everything Solid-related, `@solidjs/start` | Bump `solid-js` to latest 1.9.x; add override `seroval >= 1.6.8` until upstream pins it |
| `tar` | 6.2.1 | GHSA-23hp-3jrh-7fpw — decompression/parse DoS (plus 11 high/moderate path-traversal and file-overwrite advisories) | 7.5.21 | `@solidjs/start` / `vinxi` (nitro) | Removed with vinxi |
| `git-diff` | 2.0.6 | GHSA-6wfj-92cw-88vg — OS command injection | 2.0.7 | `kysely-codegen` (dev) | Bump `kysely-codegen` to latest |

### 2.2 Removed by dropping SolidStart / vinxi / `@solid-mediakit/trpc`

Nothing in our own code uses these packages; once `@solidjs/start`, `vinxi`, `@solid-mediakit/trpc`, `solid-devtools`, `@sentry/vite-plugin` and the direct `vite` dependency are gone, `pnpm why` should no longer find them.

| Package | Installed | # advisories | Worst | Fixed floor |
|---|---|---|---|---|
| `node-forge` | 1.3.1 | 28 | high (signature forgery, cert-chain bypass) | 1.4.3 |
| `undici` | 5.28.4 | 18 | high (TLS validation bypass, smuggling) | 6.29.1 |
| `vite` | 5.4.9 | 17 | high (`server.fs.deny` bypasses, launch-editor command injection on Windows) | 6.4.4 (Astro 7 brings Vite 8) |
| `tar` | 6.2.1 | 12 | critical | 7.5.21 |
| `h3` | 1.11.1, 1.13.0 | 5 | high (request smuggling, SSE injection, path traversal) | 1.15.9 |
| `immutable` (via sass) | 4.3.7 | 3 | high | 4.3.9 |
| `serialize-javascript` | 6.0.2 | 3 | high (RCE) | 7.1.3 |
| `@fastify/busboy` | 2.1.1 | 2 | high | 3.2.2 |
| `lodash` | 4.17.21 | 2 | high (code injection in `_.template`) | 4.18.1 |
| `nitropack` | 2.9.7 | 2 | moderate (open redirect, proxy bypass) | 2.13.4 |
| `defu` | 6.1.4 | 1 | high (prototype pollution) | 6.1.5 |
| `rollup` | 4.24.0 | 1 | high (arbitrary file write) | 4.59.0 |
| `follow-redirects` | 1.15.9 | 1 | moderate | 1.16.0 |
| `esbuild` | 0.20–0.23 | 1 | moderate (dev server CORS) | 0.25.0 |
| `@babel/helpers`, `@babel/core` | 7.25.x | 2 | moderate | 7.26.10 / 7.29.6 |

### 2.3 Direct dependencies that need a bump

| Package | Installed | # | Worst | Fix to | Notes |
|---|---|---|---|---|---|
| `kysely` | 0.27.4 | 3 | high (SQL / JSON-path injection) | **≥ 0.28.17** | §3.1 |
| `@trpc/server` | 10.45.2 | 1 | high (prototype pollution) | 10.45.3, but we go to **tRPC 11 latest** | §3.2 |
| `solid-js` | 1.9.2 | 1 | high (XSS: HTML not escaped in JSX fragments) | **≥ 1.9.4** (take latest 1.9.x) | |
| `valibot` | 0.42.1 (+1.0.0-beta.0 via `@typeschema`) | 2 | high (ReDoS) | **≥ 1.4.2** | Drop `@typeschema/valibot` |
| `zod` | 3.23.8 | 1 | high (memory exhaustion) | ≥ 4.6.6, or **remove** | Only used by `@t3-oss/env-core` (commented out) and `zodFromTypes.ts` |
| `postcss` | 8.4.47 | 4 | high (file read, path traversal via source maps) | ≥ 8.5.23 | |
| `@faker-js/faker` (dev) | 9.0.3 | 1 | high (code execution in `helpers.fake`) | ≥ 10.5.0 | |
| `sharp` (via `vite-imagetools`) | 0.33.5 | 3 | high (libvips/libheif/librsvg) | ≥ 0.35.5 | Remove `vite-imagetools`; Astro pulls its own `sharp`, check it resolves ≥ 0.35.5 |
| `kysely-codegen` (dev) | 0.17 | — | critical via `git-diff` | latest | |
| `eslint` (dev) | 9.13 | 7 | high via `flatted`; also `ajv`, `@eslint/plugin-kit`, `@humanfs/node` | latest, or remove (see §8) | |
| `tailwindcss` | 3.4.14 | 3 | moderate via `yaml`, `postcss-selector-parser`, `diff` | Tailwind 4 | §6 |

### 2.4 Shared transitive packages (pulled by several roots)

These come from SolidStart **and** from tools we keep (Tailwind, Sentry, autoprefixer, kysely-codegen, eslint). After the migration, run `pnpm update --latest` on the tools; anything still flagged gets an override.

| Package | Installed | Fixed floor |
|---|---|---|
| `brace-expansion` | 1.1.11, 2.0.1 (16 advisories) | 1.1.21 / 2.1.7 |
| `minimatch` | 3.1.2, 5.1.6, 8.0.4, 9.0.5 (13) | 3.1.4 / 5.1.8 / 11.0.1 |
| `nanoid` | 3.3.7 (4) | 3.3.18 |
| `glob` | 9.3.5, 10.4.5 (2) | 14.0.2 |
| `picomatch` | 2.3.1, 4.0.2 (4) | 2.3.2 / 4.0.4 |
| `js-yaml` | 4.1.0 (5) | 4.3.2 |
| `browserslist` | 4.24.2 (2) | 4.28.7 |
| `cross-spawn` | 7.0.3 | 7.0.5 |
| `source-map-js` | 1.2.1 | 1.2.2 |

Override block to start with. Remove each entry once `pnpm why <pkg>` shows upstream has caught up:

```jsonc
"pnpm": {
  "overrides": {
    "seroval": ">=1.6.8",
    "brace-expansion@1": ">=1.1.21",
    "brace-expansion@2": ">=2.1.7",
    "minimatch@3": ">=3.1.4",
    "minimatch@5": ">=5.1.8",
    "nanoid@3": ">=3.3.18",
    "picomatch@2": ">=2.3.2",
    "picomatch@4": ">=4.0.4",
    "js-yaml@4": ">=4.3.2",
    "browserslist": ">=4.28.7",
    "cross-spawn@7": ">=7.0.5",
    "source-map-js": ">=1.2.2"
  }
}
```

Be careful with overrides that cross a major version (for example forcing `glob` 14 onto a tool that expects 10). Prefer updating the parent package. If an override is still needed, run that tool's commands afterwards to check it still works.

### 2.5 New packages we add

- **Astro / `@astrojs/node`.** Astro has had a steady stream of advisories (open redirects in the Node adapter, `X-Forwarded-Host` handling, middleware bypass via URL encoding, XSS in server islands). Use the latest Astro 7.x and `@astrojs/node` and keep them current.
- **Better Auth.** Use the **latest stable 1.7.x, ≥ 1.7.16**. 1.7.16 (November 2026 security release) fixed "OAuth sign-in can treat an unverified provider email as verified". Earlier 2026 releases fixed OAuth account-linking takeovers and a rate-limiter IPv6 bypass. Don't use the 1.8 beta in production. **Upgrade all `better-auth` / `@better-auth/*` packages together**; they share version numbers.

---

## 3. Target stack

| Area | Target |
|---|---|
| Framework | `astro` 7.x, `output: "server"`, `@astrojs/node` standalone |
| UI | `solid-js` 1.9.x via `@astrojs/solid-js`, components as islands |
| Routing | `src/pages`, `<ClientRouter />` for view transitions (replaces `VtApi.tsx`) |
| Auth | **Better Auth ≥ 1.7.16**, Discord as the only sign-in method, no IP / user-agent tracking, Postgres through our existing `pg` pool |
| Route protection | `src/middleware.ts` → `auth.api.getSession()` → `Astro.locals.user` / `Astro.locals.session` |
| API | tRPC 11 via `fetchRequestHandler` at `/api/trpc` |
| Client data | `@trpc/client` 11 + `@tanstack/solid-query` 5 latest; `better-auth/solid` for session state |
| Validation | `valibot` ≥ 1.4.2 (Standard Schema, works with tRPC 11 directly) |
| DB | `kysely` ≥ 0.28.17, `pg` latest, `kysely-codegen` latest |
| Env | `astro:env` schema |
| Images | `astro:assets` `<Picture>` |
| Styling | Tailwind 4 via `@tailwindcss/vite` |
| Monitoring | `@sentry/astro` → GlitchTip |
| Runtime | Node 22.12+ (Astro requirement), Node 24 LTS recommended |

Packages that go away completely: `lucia`, `@lucia-auth/adapter-postgresql`, `@lucia-auth/oauth`, `oslo` (and with it `@node-rs/argon2`). `@modular-forms/solid` can go too if nothing besides the login page uses it (it is imported in 2 other files, check them).

---

## Phase 1 – Scaffold Astro alongside the old app

1. `git switch -c astro-migration`
2. Install:

   ```bash
   pnpm add astro @astrojs/solid-js @astrojs/node
   pnpm add better-auth@^1.7.16
   pnpm add @trpc/server@11 @trpc/client@11 @tanstack/solid-query@latest
   pnpm add kysely@latest pg@latest valibot@latest solid-js@latest
   pnpm add @sentry/astro
   pnpm add -D kysely-codegen@latest typescript@latest @types/node@22 @types/pg @faker-js/faker@latest tsx@latest
   ```

3. `astro.config.mjs` (replaces `app.config.ts`):

   ```js
   import { defineConfig, envField } from "astro/config";
   import node from "@astrojs/node";
   import solid from "@astrojs/solid-js";
   import sentry from "@sentry/astro";

   export default defineConfig({
     site: "https://poll.delvis.org",
     output: "server",
     adapter: node({ mode: "standalone" }),
     integrations: [solid(), sentry({ sourceMapsUploadOptions: { enabled: false } })],
     security: { checkOrigin: true },
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
         PUBLIC_SENTRY_DSN: envField.string({ context: "client", access: "public", optional: true }),
       },
     },
   });
   ```

   This replaces the commented-out `@t3-oss/env-core` code in `src/utils/env.ts`. The old `VITE_DISCORD_CLIENT_ID` / `VITE_AUTH_URL` / `VITE_SITE` in `deploy.yml` go away. **OAuth client IDs and secrets must never be `PUBLIC_*` / `VITE_*`.** Better Auth only needs them on the server.

4. `tsconfig.json`:

   ```json
   {
     "extends": "astro/tsconfigs/strict",
     "include": [".astro/types.d.ts", "**/*"],
     "exclude": ["dist"],
     "compilerOptions": {
       "jsx": "preserve",
       "jsxImportSource": "solid-js",
       "paths": { "~/*": ["./src/*"] }
     }
   }
   ```

5. `package.json` scripts:

   ```json
   "dev": "astro dev --host",
   "build": "astro build",
   "start": "node ./dist/server/entry.mjs",
   "check": "astro check",
   "migrate:latest": "tsx ./src/utils/migrate.ts",
   "migrate:down": "tsx ./src/utils/migrate.ts down",
   "new:migration": "tsx ./src/utils/migrationFilename.ts",
   "sql-types": "kysely-codegen --dialect postgres --out-file ./src/types/db.ts",
   "auth:schema": "npx @better-auth/cli@latest generate --config ./src/server/auth/auth.ts --output ./auth-schema.sql"
   ```

6. Park the old routes: `git mv src/routes src/_legacy_routes` (delete at the end).

---

## Phase 2 – Server side (DB, tRPC, validation)

### 3.1 Kysely 0.27 → ≥ 0.28.17

- Generate DB types into the repo (`pnpm sql-types` → `src/types/db.ts`) instead of importing from `kysely-codegen/dist/db`, which breaks on every reinstall.
- `src/server/db.ts`:

  ```ts
  import { Kysely, PostgresDialect } from "kysely";
  import pg from "pg";
  import { PSQL_HOST, PSQL_DATABASE, PSQL_USERNAME, PSQL_PASSWORD, PSQL_PORT } from "astro:env/server";
  import type { DB } from "~/types/db";

  export const pool = new pg.Pool({
    host: PSQL_HOST, database: PSQL_DATABASE, user: PSQL_USERNAME, password: PSQL_PASSWORD, port: PSQL_PORT,
  });
  export const db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }), log: ["error"] });
  ```

  `migrate.ts` runs through `tsx` outside Astro, so it can't import `astro:env`. Keep `process.env` + `dotenv` there.
- Update `markdowns/DbUpdate.md`: it still refers to `./apps/server` and `ts-to-zod`.

### 3.2 tRPC 10 → 11

1. Inputs: tRPC 11 accepts Standard Schema, so drop `wrap()` / `@typeschema/valibot` and pass valibot schemas directly.
2. Valibot 0.42 → 1.x uses the `pipe` API: `v.pipe(v.string(), v.minLength(4), …)` instead of `string([minLength(4)])`.
3. **Delete** the `signIn`, `signUp`, `logOut` and `authStatus` procedures (`basic/authQandM.ts`). Better Auth handles all of that now (Phase 3).
4. Context: remove everything from `vinxi/server`. The user and session come from middleware:

   ```ts
   // src/server/trpc/context.ts
   import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
   import type { APIContext } from "astro";
   import { db } from "../db";

   export const createContext = (opts: FetchCreateContextFnOptions, astro: APIContext) => ({
     db,
     req: opts.req,
     resHeaders: opts.resHeaders,
     user: astro.locals.user,       // Better Auth user (incl. role) or null
     session: astro.locals.session, // Better Auth session or null
   });
   export type Context = Awaited<ReturnType<typeof createContext>>;
   ```

5. `userProcedure` / `adminProcedure` in `trpc/utils.ts` become simpler. They no longer query `auth_user`; `ctx.user.role` is already loaded:

   ```ts
   export const userProcedure = publicProcedure.use(({ ctx, next }) => {
     if (!ctx.user || !ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
     return next({ ctx: { user: ctx.user, session: ctx.session } });
   });
   export const adminProcedure = userProcedure.use(({ ctx, next }) => {
     if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
     return next();
   });
   ```

   Replace `ctx.session.userId` with `ctx.user.id` throughout the routers.

6. Endpoint `src/pages/api/trpc/[trpc].ts`:

   ```ts
   import type { APIRoute } from "astro";
   import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
   import { appRouter } from "~/server/trpc/router/trpcRouters";
   import { createContext } from "~/server/trpc/context";

   export const ALL: APIRoute = (ctx) =>
     fetchRequestHandler({
       endpoint: "/api/trpc",
       req: ctx.request,
       router: appRouter,
       createContext: (opts) => createContext(opts, ctx),
       maxBatchSize: 10,
     });
   ```

7. Client: replace `@solid-mediakit/trpc` (SolidStart-only) with the vanilla tRPC client plus solid-query:

   ```ts
   // src/utils/trpc.ts
   import { createTRPCClient, httpBatchLink } from "@trpc/client";
   import { QueryClient } from "@tanstack/solid-query";
   import type { IAppRouter } from "~/server/trpc/router/trpcRouters";

   export const api = createTRPCClient<IAppRouter>({ links: [httpBatchLink({ url: "/api/trpc" })] });
   export const queryClient = new QueryClient();
   ```

   Call sites change from `trpc.x.createQuery(() => input)` to `useQuery(() => ({ queryKey: ["x", input], queryFn: () => api.x.query(input) }))`. The same goes for mutations: `useMutation(() => ({ mutationFn: api.y.mutate, onSuccess: () => queryClient.invalidateQueries() }))`. 15 files need this; a small helper keeps the call sites short.

---

## Phase 3 – Better Auth, OAuth only

### 4.1 Discord OAuth app

In the Discord Developer Portal → your application (the one whose client ID was in `deploy.yml`) → **OAuth2**:

- Add both redirect URLs below (Discord allows several per app, so one app covers dev and prod). If you'd rather keep dev credentials separate, use a second app.
- Copy the **Client ID** and **Client Secret** into `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` as runtime secrets. Reset the secret if it was ever committed or put in a `VITE_*` variable.

| Provider | Redirect (prod) | Redirect (dev) | Scopes |
|---|---|---|---|
| Discord | `https://poll.delvis.org/api/auth/callback/discord` | `http://localhost:4321/api/auth/callback/discord` | `identify` |

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32` (one per environment) and set `BETTER_AUTH_URL=https://poll.delvis.org`.

Adding Google or another provider later is one more entry in `socialProviders`.

### 4.2 Database schema (fresh database)

Better Auth needs four tables: user, `session`, `account`, `verification`. Since the database is new, **rewrite the existing auth migration in place** (`src/migrations/2023_03_14_06_11_46_auth.ts`) instead of adding an ALTER migration. Nothing has run it in production yet.

Keep the user table name **`auth_user`**:
- `2023_03_14_06_12_32_data.ts` and `2023_08_16_10_22_07_articles.ts` already reference `auth_user.id ON DELETE CASCADE`, so they stay untouched.
- It avoids `user`, a reserved word in Postgres.

Better Auth gets told about the name via `user.modelName` (§4.3).

Workflow:

1. Write `src/server/auth/auth.ts` (§4.3).
2. `pnpm auth:schema` → `auth-schema.sql`. The CLI emits exactly the tables and columns your config expects (including the `auth_user` name, the snake_case field mapping and the `role` field).
3. Translate that into the Kysely migration so migrations stay the single source of truth. It will look roughly like this; **the generated SQL wins wherever the two differ**:

```ts
import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema.createTable("auth_user")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("email", "text", (c) => c.notNull().unique())          // synthetic, see §4.3
    .addColumn("email_verified", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("image", "text")
    .addColumn("role", "text", (c) => c.notNull().defaultTo("user").check(sql`role in ('user', 'admin')`))
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createTable("session")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .addColumn("token", "text", (c) => c.notNull().unique())
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("user_id", "text", (c) => c.notNull().references("auth_user.id").onDelete("cascade"))
    .execute();

  await db.schema.createTable("account")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("account_id", "text", (c) => c.notNull())
    .addColumn("provider_id", "text", (c) => c.notNull())
    .addColumn("user_id", "text", (c) => c.notNull().references("auth_user.id").onDelete("cascade"))
    .addColumn("access_token", "text")
    .addColumn("refresh_token", "text")
    .addColumn("id_token", "text")
    .addColumn("access_token_expires_at", "timestamptz")
    .addColumn("refresh_token_expires_at", "timestamptz")
    .addColumn("scope", "text")
    .addColumn("password", "text") // unused (no email/password), but part of Better Auth's schema
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("account_provider_account_unique", ["provider_id", "account_id"])
    .execute();

  await db.schema.createTable("verification")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("identifier", "text", (c) => c.notNull())
    .addColumn("value", "text", (c) => c.notNull())
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex("session_user_id_idx").on("session").column("user_id").execute();
  await db.schema.createIndex("account_user_id_idx").on("account").column("user_id").execute();
  await db.schema.createIndex("verification_identifier_idx").on("verification").column("identifier").execute();
}

export async function down(db: Kysely<any>) {
  for (const t of ["verification", "account", "session", "auth_user"])
    await db.schema.dropTable(t).ifExists().execute();
}
```

Gone compared to the Lucia schema: `hashed_password`, `username` and the `user_session` table. Then `pnpm migrate:latest` and `pnpm sql-types` on the fresh DB.

While rewriting migrations on an empty DB, it's a good moment to fix the `//BUG add .unique()` comments in the data/articles migrations if a user really should only have one row there.

### 4.3 `src/server/auth/auth.ts`

```ts
import { betterAuth } from "better-auth";
import {
  BETTER_AUTH_SECRET, BETTER_AUTH_URL,
  DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
} from "astro:env/server";
import { pool } from "~/server/db";

// The site promises not to store users' emails or usernames from providers.
// Better Auth requires an email on every user, so store a synthetic, non-routable one.
const syntheticEmail = (provider: string, id: string | number) => `${provider}_${id}@users.invalid`;

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  database: pool, // same pg pool as Kysely
  trustedOrigins: [BETTER_AUTH_URL],

  emailAndPassword: { enabled: false }, // OAuth only

  socialProviders: {
    discord: {
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      scope: ["identify"],
      mapProfileToUser: (p) => ({ email: syntheticEmail("discord", p.id), emailVerified: false, name: "", image: null }),
    },
  },

  user: {
    modelName: "auth_user",
    fields: { emailVerified: "email_verified", createdAt: "created_at", updatedAt: "updated_at" },
    // The §4.2 migration uses snake_case everywhere, so session/account/verification need the same mapping
    // (userId → user_id, expiresAt → expires_at, ipAddress → ip_address, …) via
    // `session: { fields: {…} }`, `account: { fields: {…} }`, `verification: { fields: {…} }`.
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false }, // input:false → client can't set it
    },
    deleteUser: { enabled: true }, // "delete my account and data" (FK cascades remove poll answers)
  },

  account: {
    // Synthetic emails must never be used to auto-link accounts across providers.
    accountLinking: { enabled: false },
    encryptOAuthTokens: true, // we never call provider APIs; tokens are stored encrypted (or wipe them in a hook)
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,      // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  // Rate limiting is done in Cloudflare WAF (§4.7), so Better Auth doesn't need client IPs at all.
  rateLimit: { enabled: false },
  advanced: {
    useSecureCookies: import.meta.env.PROD,
    ipAddress: { disableIpTracking: true }, // session.ip_address stays NULL
  },

  databaseHooks: {
    session: {
      create: {
        // Don't store the browser user agent either.
        before: async (session) => ({ data: { ...session, userAgent: null, ipAddress: null } }),
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

Notes:

- **Check option names against the Better Auth docs for the exact version you install.** This config targets 1.7.x; names like `encryptOAuthTokens`, `disableIpTracking` and the `databaseHooks` signature have changed between minors before. Run `pnpm check` after installing.
- **About `mapProfileToUser` and email:** with only the `identify` scope Discord doesn't share an email, and even with the `email` scope it returns `email: null` for phone-only accounts. Better Auth's docs recommend synthesizing an email in `mapProfileToUser` for exactly this case. Here we do it for everyone, so no real email is ever stored. That keeps the existing privacy promise ("doesn't save your email or username").
- Each Discord account maps to exactly one user (by Discord user ID). Implicit linking by email stays off, so adding another provider later can't merge accounts by accident.
- Scope is kept minimal: Discord `identify` only (no `email`, no `guilds`). Check that Better Auth's Discord provider doesn't add `email` to the default scopes in your version; if it does, set the provider's option for disabling default scopes so only `identify` is requested.
- `role` is never settable from the client (`input: false`). Promote admins in SQL: `UPDATE auth_user SET role = 'admin' WHERE id = '…'`.

### 4.4 Handler, middleware, locals

`src/pages/api/auth/[...all].ts`:

```ts
import type { APIRoute } from "astro";
import { auth } from "~/server/auth/auth";

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};
```

`src/middleware.ts`:

```ts
import { defineMiddleware } from "astro:middleware";
import { auth } from "~/server/auth/auth";

const USER_ONLY = ["/user", "/questionares"]; // adjust to the real list
const ADMIN_ONLY = ["/admin"];

export const onRequest = defineMiddleware(async (ctx, next) => {
  // CSRF for our own JSON API. Better Auth protects /api/auth itself (trustedOrigins),
  // and Astro's checkOrigin only covers form content types.
  if (ctx.url.pathname.startsWith("/api/trpc") && !["GET", "HEAD"].includes(ctx.request.method)) {
    const origin = ctx.request.headers.get("Origin");
    if (!origin || new URL(origin).origin !== new URL(import.meta.env.SITE).origin) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const result = await auth.api.getSession({ headers: ctx.request.headers });
  ctx.locals.user = result?.user ?? null;
  ctx.locals.session = result?.session ?? null;

  const path = ctx.url.pathname;
  if (USER_ONLY.some((p) => path.startsWith(p)) && !ctx.locals.user)
    return ctx.redirect(`/login?redir=${encodeURIComponent(path)}`);
  if (ADMIN_ONLY.some((p) => path.startsWith(p)) && ctx.locals.user?.role !== "admin")
    return ctx.redirect("/login");

  return next();
});
```

`src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
declare namespace App {
  interface Locals {
    user: import("~/server/auth/auth").Session["user"] | null;
    session: import("~/server/auth/auth").Session["session"] | null;
  }
}
```

Only accept a `redir` value that is a same-site path (starts with `/`, not `//`). Otherwise it becomes an open redirect.

This replaces `userLoader.ts`, `validateSession` in `context.ts`, `ProtectedUser.tsx` and `ProtectedAdmin.tsx`. It also fixes the TODOs about protected-route redirects and the bell/login status needing a refresh, because the server now knows the user on every request.

### 4.5 Client side

`src/utils/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/solid";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "~/server/auth/auth";

export const authClient = createAuthClient({ plugins: [inferAdditionalFields<typeof auth>()] });
```

The new login page (`src/pages/login.astro` + a small island) is a single Discord button:

```tsx
import { authClient } from "~/utils/auth-client";

export default function LoginButtons(props: { redir?: string }) {
  const to = props.redir?.startsWith("/") && !props.redir.startsWith("//") ? props.redir : "/";
  return (
    <div class="flex flex-col gap-6">
      <button class="…" onClick={() => authClient.signIn.social({ provider: "discord", callbackURL: to })}>
        Sign in with Discord
      </button>
    </div>
  );
}
```

- Navbar / notification bell: pass `Astro.locals.user` as a prop from the layout (server truth on every navigation), or use `authClient.useSession()` inside the island.
- Logout: `authClient.signOut().then(() => navigate("/"))`. Better Auth deletes the session row server-side, which fixes the old `logOut` that only cleared the cookie.
- Delete account (`removeAccountAndData`): either keep the tRPC procedure (delete from `auth_user`; cascades remove sessions, accounts and data) or call `authClient.deleteUser()`. Use one, not both.
- Delete: the username/password form, the "Create new account?" and "Incorrect username or password" modals, the shared username/password valibot schemas, and the `/login/github` link.
- **Update `privacyNotice` and the login copy.** It currently talks about usernames and passwords and says only an "openId" is stored. Now, per user, the app stores only the provider name, the provider account ID, a synthetic email, an encrypted short-lived OAuth access token, and session rows (token, expiry). No IP address, user agent, real email or provider username is stored by the app. Also mention that Cloudflare processes visitor IPs for security and rate limiting.

### 4.6 Remaining app-level security fixes

1. Fake-data mutations (`fakeForDev`, `fakeForDevBulk`, `fakeArticlesForDev`, `fakeForFake`) must be `adminProcedure` **and** refuse to run when `import.meta.env.PROD`.
2. Validate dynamic route params (`pOrT`, `fOrT`, `statsText`, `personalQuestions`) in each page against the known values, and 404 otherwise.
3. Rate limiting for write procedures (post article, post stats) is also Cloudflare's job (§4.7). If you want an extra app-side limit that needs no IPs, a small tRPC middleware keyed by `ctx.user.id` works.


### 4.7 Rate limiting in Cloudflare WAF (instead of the app)

Better Auth's rate limiter and IP tracking are switched off (§4.3), so the app never stores client IPs. For that to be safe, Cloudflare has to be the **only** way in:

1. **Make the origin unreachable except through Cloudflare.** Either run `cloudflared` (Cloudflare Tunnel) next to the container and expose no public port, or firewall the host so ports 80/443 only accept Cloudflare's published IP ranges. Without this, anyone who finds the server IP bypasses every WAF rule.
2. **Rate-limit rules** (Security → WAF → Rate limiting rules), for example:
   - `/api/auth/*`: low limit per IP (e.g. ~10 requests per 10 s), action Block or Managed Challenge. This covers OAuth start and callback abuse.
   - `/api/trpc/*` with method ≠ GET: moderate limit per IP for posting stats and articles.
   - The free plan limits how many rules you get and which counting windows are available, so combine paths into one rule if needed.
3. Optional: a WAF custom rule that challenges known bots on `/login` and `/api/auth/*`, or Turnstile on the login page.
4. Keep the `/api/trpc` Origin check in middleware (§4.4). Cloudflare doesn't do CSRF protection for you.

Trade-off: there is no per-user abuse limit inside the app anymore. If you later need one, key it by `ctx.user.id` (no IP needed).

---

## Phase 4 – Routes → `src/pages`

Start with a thin `.astro` page per route that mounts the existing Solid component with `client:only="solid-js"`. The app is `ssr: false` today, so behaviour stays the same (suspense queries, localStorage skip logic, etc.). Pages that would benefit can move to SSR islands later.

| Old (`src/routes`) | New (`src/pages`) |
|---|---|
| `index.tsx` | `index.astro` (`export const prerender = true`) |
| `login/(login).tsx` | `login.astro` (OAuth buttons, §4.5) |
| `admin/(admin).tsx`, `adminCrud.tsx`, `fake.tsx` | `admin/index.astro`, `admin/adminCrud.astro`, `admin/fake.astro` (dev only) |
| `api/trpc/[trpc].ts` | `api/trpc/[trpc].ts` |
| — | `api/auth/[...all].ts` (new, Better Auth) |
| `articles/(articles).tsx` | `articles/index.astro` |
| `compare/(compare_main).tsx`, `compare/[pOrT]/[fOrT]/compare.tsx` | `compare/index.astro`, `compare/[pOrT]/[fOrT]/compare.astro` |
| `pollResults/(pollResults_main).tsx`, `pollResults/[pOrT]/[fOrT]/pollResults.tsx` | `pollResults/index.astro`, `pollResults/[pOrT]/[fOrT]/pollResults.astro` |
| `privacyNotice.tsx` | `privacyNotice.astro` (`prerender = true`, text updated, §4.5) |
| `questionares/(questionares).tsx`, `[personalQuestions].tsx` | `questionares/index.astro`, `questionares/[personalQuestions].astro` |
| `texts/[pOrT]/[fOrT]/[statsText].tsx` | same path, `.astro` |
| `user/data.tsx` | `user/data.astro` |
| `[...404].tsx` | `404.astro` |
| `testing/*` | `src/pages/_testing/*` (the `_` prefix excludes it from routing) or a PROD guard |

The `testing` row closes the "exclude some routes on prod" TODO and removes the `rollupOptions.external` hack.

Layout:

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from "astro:transitions";
import { PUBLIC_UMAMI_ID } from "astro:env/client";
import NavBar from "~/components/Navbar";
import Footer from "~/components/Footer";
import "~/app.css";
const { title = "Schizophrenia poll" } = Astro.props;
const user = Astro.locals.user ? { id: Astro.locals.user.id, role: Astro.locals.user.role } : null;
---
<html lang="en" class="slide">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    <title>{title}</title>
    <ClientRouter />
    {import.meta.env.PROD && PUBLIC_UMAMI_ID && (
      <script is:inline async src="https://umami.delvis.org/script.js" data-website-id={PUBLIC_UMAMI_ID}></script>
    )}
  </head>
  <body class="min-h-screen lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
    <NavBar client:only="solid-js" user={user} transition:persist />
    <slot />
    <Footer />
  </body>
</html>
```

Pass only the fields an island needs (`id`, `role`), never the whole user or session object. Island props are serialized into the HTML.

Each island using queries is wrapped in `QueryClientProvider` with the shared `queryClient`, plus the `ErrorBoundary` from the old `app.tsx`. A `withQuery(Component)` HOC avoids repeating that. `ClientRouter` + `transition:persist` replaces `VtApi.tsx` and the manual `history.scrollRestoration`.

---

## Phase 5 – Component API replacements

| SolidStart / Solid Router | Astro |
|---|---|
| `<A href>` | `<a href>` (ClientRouter intercepts) |
| `useNavigate()` | `navigate()` from `astro:transitions/client` |
| `useParams()` / `useSearchParams()` | props from `Astro.params` / `Astro.url.searchParams` |
| `useBeforeLeave` (`VtApi.tsx`) | ClientRouter; delete `VtApi.tsx` |
| `cache` / `createAsync` / `"use server"` | middleware + `Astro.locals`; delete `ProtectedUser`/`ProtectedAdmin` |
| `trpc.authStatus.createQuery()` | `user` prop from layout, or `authClient.useSession()` |
| `route()` from `routes-gen` | small typed `src/utils/routes.ts`; remove `routes-gen`, `@routes-gen/solid-start` |
| `@solidjs/meta` `<Title>` | `title` prop on `Layout.astro` |
| `import.meta.env.VITE_*` | `astro:env/client` |

`chartist`, `solid-transition-group`, `@solid-primitives/refs`, `@solid-primitives/transition-group`, `clsx`, `tailwind-merge` keep working inside islands; update them to latest.

---

## Phase 6 – Assets, styling, monitoring

- **Images:** `vite-imagetools` → `astro:assets` `<Picture src={…} widths={[300, 600, 1200]} formats={["avif", "webp"]} />` in `.astro` pages (pass to islands as children/slots). Removing `vite-imagetools` also removes the vulnerable `sharp` 0.33.5. Keep only one of `public/pictures` / `src/assets/pictures`.
- **Tailwind 4:** `@tailwindcss/vite` and `npx @tailwindcss/upgrade` to migrate `tailwind.config.cjs` (custom `bg-gradient-angle`). This removes `postcss.config.cjs`, `autoprefixer` and the Tailwind 3 transitive advisories. Don't use the deprecated `@astrojs/tailwind`.
- **Sentry:** `@sentry/astro` replaces the manual init in `app.tsx`; DSN from env. Keep Replay off, since GlitchTip doesn't support it.
- **Umami:** in `Layout.astro`; drop `@solid-primitives/script-loader`.

---

## Phase 7 – Docker & CI

Build when the image is built, not at container start:

```dockerfile
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG PUBLIC_SITE=https://poll.delvis.org
ARG PUBLIC_UMAMI_ID
ARG PUBLIC_SENTRY_DSN
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/src/migrations ./src/migrations
COPY --from=build /app/src/utils/migrate.ts ./src/utils/migrate.ts
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
```

```sh
#!/bin/sh
set -e
npx tsx ./src/utils/migrate.ts
exec node ./dist/server/entry.mjs
```

- Runtime secrets (`PSQL_*`, `BETTER_AUTH_*`, `DISCORD_*`) are read at runtime and stay out of the image. Only `PUBLIC_*` values are build args.
- The reverse proxy must forward `X-Forwarded-Proto`, and `BETTER_AUTH_URL` must be the public `https://` URL, or OAuth callbacks and secure cookies break. The app no longer needs the client IP. Also turn off IP logging in the reverse proxy's access log if you want IPs gone end to end.
- GitHub Actions: update `docker/login-action@v1` to the current major and pass `PUBLIC_*` as `build-args`. Before pushing the image, add a job that runs:
  `pnpm install --frozen-lockfile && pnpm audit --prod --audit-level=high && pnpm check && pnpm build`.
- `.dockerignore`: `.env*`, `.git`, `node_modules`, `dist`, `audit.json`.

---

## Phase 8 – Cleanup & verification

Remove from `package.json`:

```
@solidjs/start vinxi @solidjs/router @solidjs/meta @solid-mediakit/trpc solid-devtools
lucia @lucia-auth/adapter-postgresql @lucia-auth/oauth oslo
@typeschema/valibot @t3-oss/env-core zod (check zodFromTypes.ts usage first)
routes-gen @routes-gen/solid-start
vite vite-imagetools rollup-plugin-visualizer
@sentry/browser @sentry/vite-plugin @solid-primitives/script-loader
@modular-forms/solid (if nothing else uses it after the login page is gone)
postcss autoprefixer (with Tailwind 4)
```

Delete: `app.config.ts`, `src/app.tsx`, `src/entry-client.tsx`, `src/entry-server.tsx`, `src/_legacy_routes/`, `VtApi.tsx`, `ProtectedUser.tsx`, `ProtectedAdmin.tsx`, `src/server/loader/`, `src/lib/auth/lucia.ts`, `src/server/trpc/router/basic/authQandM.ts`, `src/types/app.d.ts`, `src/types/routes.d.ts`, `global.d.ts` (if vinxi-only), `postcss.config.cjs`, `tailwind.config.cjs` (after the Tailwind 4 upgrade). Rewrite `README.MD`, which still describes Create JD App + Vercel.

Linting: there is both `.eslintrc.json` (legacy format, ignored by ESLint 9) and `biome.json`. Keeping only Biome removes the 7 ESLint-chain advisories too.

Verification:

1. `pnpm audit --json > audit-after.json`: no critical or high. `pnpm why seroval kysely tar h3 node-forge undici vite sharp` shows patched versions or nothing. Remove any override that is no longer needed.
2. `pnpm check` and `pnpm build` pass.
3. Smoke test (`pnpm build && pnpm start`, behind the proxy for the prod check):
   - fresh DB: `pnpm migrate:latest` runs cleanly, and `down` then `latest` again works
   - sign in with Discord (new user created, `role = 'user'`, synthetic email, no real email/name in `auth_user`)
   - promote yourself: `UPDATE auth_user SET role = 'admin' WHERE id = '…'` and check `/admin`
   - sign out deletes the `session` row; an expired or deleted session redirects protected pages to `/login`
   - `/user/data` and `/admin` redirect when logged out / not admin; `?redir=` only accepts local paths
   - "delete my account" removes the user, sessions, accounts and their data
   - questionnaires (skip logic + localStorage), poll results, compare and stats texts for every `pOrT`/`fOrT`
   - articles: submit, pagination, admin accept/decline, notification bell updates without refresh
   - view transitions, back/forward scroll position on the stats page
   - `_testing` pages and fake-data mutations unreachable in prod
   - `session.ip_address` and `session.user_agent` are NULL after logging in
   - Cloudflare WAF blocks rapid requests to `/api/auth/*` and `/api/trpc/*`, and the origin can't be reached directly by IP
   - Sentry/GlitchTip receives a test error; Umami records a page view
4. Add `.github/dependabot.yml` (npm weekly, GitHub Actions monthly) or Renovate. Better Auth and Astro both ship security fixes often.

---

## Suggested commit order

1. `chore: scaffold astro config next to solid-start`
2. `chore(deps): kysely 0.28, trpc 11, valibot 1, solid-js 1.9 latest + overrides` (lowers the audit count immediately)
3. `feat(auth): better-auth with discord, rewritten auth migration`
4. `feat: astro middleware, trpc + auth endpoints`
5. `feat: port pages` (one commit per route group)
6. `feat: images, sentry, umami, env, tailwind 4`
7. `chore: docker multi-stage + CI audit`
8. `chore: remove solid-start/vinxi/lucia and legacy files`

## References

- Astro upgrade guides: https://docs.astro.build/en/guides/upgrade-to/v6/ · https://docs.astro.build/en/guides/upgrade-to/v7/
- Astro Solid / Node adapter: https://docs.astro.build/en/guides/integrations-guide/solid-js/ · https://docs.astro.build/en/guides/integrations-guide/node/
- Better Auth + Astro: https://better-auth.com/docs/integrations/astro
- Better Auth OAuth (incl. "Handling providers without email"): https://better-auth.com/docs/concepts/oauth
- Better Auth Discord: https://better-auth.com/docs/authentication/discord
- Better Auth session management (ipAddress / userAgent fields): https://better-auth.com/docs/concepts/session-management
- Cloudflare WAF rate limiting rules: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Better Auth options reference (modelName, fields, additionalFields, rateLimit): https://www.better-auth.com/docs/reference/options
- Better Auth PostgreSQL adapter: https://better-auth.com/docs/adapters/postgresql
- tRPC fetch adapter (Astro section): https://trpc.io/docs/server/adapters/fetch · v10→v11: https://trpc.io/docs/migrate-from-v10-to-v11
- Valibot v1 migration: https://valibot.dev/guides/migrate-to-v1/
