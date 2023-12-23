// src/routes/login/github/index.ts
import { redirect } from "@solidjs/router";
import { serializeCookie } from "lucia/dist/utils/cookie";
import { auth, githubAuth } from "~/auth/lucia";
import { type APIEvent } from "@solidjs/start/server";


export const GET = async (event: APIEvent) => {
  const authRequest = auth.handleRequest(event.request);
  const session = await authRequest.validate();
  if (session) {
    return redirect("/", 302); // redirect to profile page
  }
  const [url, state] = await githubAuth.getAuthorizationUrl();
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": serializeCookie("github_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        path: "/",
        maxAge: 60 * 60,
      }),
    },
  });
};
