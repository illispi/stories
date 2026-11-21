// Production start without pnpm: apply pending database migrations, then start the server.
//   node --env-file=.env start.mjs
// The server only starts if the migrations succeed. Needs Node 26 (runs the TypeScript
// migration files with its built-in type stripping).
import { migrate } from "./src/utils/migrate.ts";

// As PID 1 in a container, Node ignores stop signals unless they're handled, so
// `docker stop` would wait 10 s and then kill it. Exit promptly instead.
for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => process.exit(0));

try {
	await migrate();
} catch (error) {
	console.error("Not starting the server: database migrations failed.", error);
	process.exit(1);
}

await import("./dist/server/entry.mjs");
