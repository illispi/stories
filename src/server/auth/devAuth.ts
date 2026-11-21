/**
 * Development only: helpers for testing with several accounts when you only have one
 * Discord account. Uses Better Auth's test-utils plugin on a separate instance with the
 * same options (same database and secret), so the sessions it creates are normal sessions
 * the real `auth` accepts. Imported only behind `import.meta.env.DEV` checks.
 */
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { authOptions } from "./auth";

export { TEST_EMAIL_DOMAIN } from "./testEmail";

let instance: ReturnType<typeof create> | undefined;
const create = () => betterAuth({ ...authOptions, plugins: [testUtils()] });

export const devTestHelpers = async () => {
	if (!import.meta.env.DEV) throw new Error("Test users are only available in development");
	instance ??= create();
	return (await instance.$context).test;
};
