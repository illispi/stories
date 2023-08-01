import Github from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import { SolidAuth, type SolidAuthConfig } from "@solid-auth/base";
import { serverEnv } from "~/env/server";

import KyselyAdapter from "~/db/kyselyAdapter";
import { db } from "~/server/server";
// session-type.d.ts
import type { DefaultSession } from "@auth/core/types";


declare module "@auth/core/types" {
  export interface Session extends DefaultSession {
    user?: User & { role: "admin" | "user" }
  }
}

export const authOpts: SolidAuthConfig = {
  providers: [
    // @ts-expect-error Types Issue
    Github({
      clientId: serverEnv.GITHUB_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
      authorization: { params: { scope: "openid" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
          role: "user"
        };
      },
    }),
    // @ts-expect-error Types Issue
    Discord({
      clientId: serverEnv.DISCORD_ID,
      clientSecret: serverEnv.DISCORD_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
      profile(profile) {
        return {
          id: profile.id,
          role: "user"
        };
      },
    }),
  ],
  debug: false,
  adapter: KyselyAdapter(db),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role

      return session;
    },
  },
};

export const { GET, POST } = SolidAuth(authOpts);

//BUG in authjs for discord scopes https://github.com/nextauthjs/next-auth/issues/6873
