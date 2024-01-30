
import type { App } from "../../index";

export default (app: App) =>
  app.get("", async (context) => {
    if (!context.user) {
      return new Response(null, {
        status: 401,
      });
    }

    return app;
  });
