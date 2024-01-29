import { Elysia } from 'elysia';
import { testRoute } from './routes/testElysiaRoute';

export const app = new Elysia({ prefix: '/api' }).use(testRoute).compile();

export type App = typeof app;
