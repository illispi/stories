import Github from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import type { SolidAuthConfig } from "@auth/solid-start";
import { SolidAuth } from "@auth/solid-start";
import { serverEnv } from "~/env/server";

import KyselyAdapter from "~/db/kyselyAdapter";
import { db } from "~/server/server";

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
      authorization: { params: { scope: "openid" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
        };
      },
    }),
  ],
  debug: false,
  adapter: KyselyAdapter(db),
};

export const { GET, POST } = SolidAuth(authOpts);
