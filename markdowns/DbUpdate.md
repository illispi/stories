# Changing the database schema

1. `pnpm new:migration <name>` creates `src/migrations/<timestamp>_<name>.ts`. Write `up` and `down`.
2. `pnpm migrate:latest` applies it (`pnpm migrate:down` rolls back one migration).
3. `pnpm sql-types` regenerates `src/types/db.ts` from the database. Commit it.
4. If the change affects poll answers, update the zod schemas in `src/server/schemas/`
   and the question lists in `src/data/`.

Migrations run with Node 26's built-in TypeScript support, so use `import type` for types
and avoid TypeScript-only syntax such as `enum`.
