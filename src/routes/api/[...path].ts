import { type APIEvent } from "@solidjs/start/server/types";
import { app } from "./elysia";

const handler = async (event: APIEvent) => {
  console.log(event.request.headers);
  return await app.handle(event.request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
