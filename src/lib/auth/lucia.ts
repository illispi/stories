import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { Lucia } from 'lucia';
import { pool } from '~/routes/api/db';

const adapter = new NodePostgresAdapter(pool, {
  user: 'auth_user',
  session: 'user_session',
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: import.meta.env.PROD,
    },
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
  }
}
