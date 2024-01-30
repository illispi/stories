import { Elysia } from "elysia";
import { db } from "../db";
import type {  App } from "../index";

export const authRoute = (app: App) =>
  app.get("", async (context) => {
    if (!context.user) {
      return new Response(null, {
        status: 401,
      });
    }

    return app;
  });
