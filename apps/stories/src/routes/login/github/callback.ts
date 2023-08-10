import { auth, githubAuth } from "~/auth/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";
import { parseCookie, redirect } from "solid-start";

import type { APIEvent } from "solid-start";

export const GET = async (event: APIEvent) => {
  const authRequest = auth.handleRequest(event.request);
  const session = await authRequest.validate();
  if (session) {
    return redirect("/", 302); // redirect to profile page
  }
  const cookies = parseCookie(event.request.headers.get("Cookie") ?? "");
  const storedState = cookies.github_oauth_state;
  const url = new URL(event.request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    console.log("first", code);
    const { existingUser, createUser } = await githubAuth.validateCallback(
      code
    );

    const getUser = async () => {
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          role: "user",
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: { role: user.role },
    });
    const sessionCookie = auth.createSessionCookie(session);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      // invalid code
      console.log(e);
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};
