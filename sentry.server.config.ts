import * as Sentry from "@sentry/astro";
import { PUBLIC_SENTRY_DSN } from "astro:env/client";

// Server errors (page rendering, API routes, tRPC) → the same Sentry project as the browser.
// sendDefaultPii: false keeps IP addresses, cookies and headers out of the events.
Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: import.meta.env.PROD && Boolean(PUBLIC_SENTRY_DSN),
	environment: import.meta.env.MODE,
	tracesSampleRate: 0.1,
	sendDefaultPii: false,
});
