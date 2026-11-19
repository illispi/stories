/// <reference path="../.astro/types.d.ts" />

declare namespace App {
	interface Locals {
		user: import("./server/auth/auth").AuthUser | null;
		session: import("./server/auth/auth").AuthSession["session"] | null;
	}
}
