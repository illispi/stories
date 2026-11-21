// Production start without pnpm: apply pending database migrations, then start the server.
//   node --env-file=.env start.mjs
// The server only starts if the migrations succeed. Needs Node 26 (runs the TypeScript
// migration files with its built-in type stripping).
import { migrate } from "./src/utils/migrate.ts";

try {
	await migrate();
} catch (error) {
	console.error("Not starting the server: database migrations failed.", error);
	process.exit(1);
}

await import("./dist/server/entry.mjs");
