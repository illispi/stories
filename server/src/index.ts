import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import fastifycors from "@fastify/cors";

const server = fastify({
  maxParamLength: 5000,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

server.register(fastifycors, {
  origin: [`http://127.0.0.1:3000`],
  credentials: true,
});

(async () => {
  try {
    await server.listen(4000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
