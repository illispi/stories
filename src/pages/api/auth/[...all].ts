import type { APIRoute } from "astro";
import { auth } from "~/server/auth/auth";

export const ALL: APIRoute = (ctx) => auth.handler(ctx.request);
