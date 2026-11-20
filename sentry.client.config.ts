import * as Sentry from "@sentry/astro";
import { PUBLIC_SENTRY_DSN } from "astro:env/client";

// Browser errors → Sentry. Production only, and no personal data (IP addresses, cookies),
// in line with the privacy notice.
Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: import.meta.env.PROD && Boolean(PUBLIC_SENTRY_DSN),
	environment: import.meta.env.MODE,
	tracesSampleRate: 0.1,
	sendDefaultPii: false,
});
