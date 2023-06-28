import Github from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import type { SolidAuthConfig } from "@auth/solid-start";
import { SolidAuth } from "@auth/solid-start";
import { serverEnv } from "~/env/server";

import KyselyAdapter from "~/db/kyselyAdapter";
import { db } from "~/server/server";
import { Session } from "@auth/core/types";

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
        };
      },
    }),
  ],
  debug: false,
  adapter: KyselyAdapter(db),
  callbacks: {
    async session({ session, user }) {
      const r = (session.user.id = user.id);
      return r;
    },
  },
};

export const { GET, POST } = SolidAuth(authOpts);

//BUG in authjs for discord scopes https://github.com/nextauthjs/next-auth/issues/6873
//TODO authjs has role based option in docs
