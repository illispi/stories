import type { Component, VoidComponent } from "solid-js";
import { A } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getSession } from "@auth/solid-start";
import { authOpts } from "./api/auth/[...solidauth]";
import { signOut, signIn } from "@auth/solid-start/client";
import { route } from "routes-gen";

const AuthShowcase: VoidComponent = () => {
  const sessionData = createSession();
  return (
    <div class="flex flex-col items-center justify-center gap-4 bg-black">
      <p class="text-center text-2xl text-white">
        {sessionData() && <span>Logged in as {sessionData()?.user?.name}</span>}
      </p>
      <button
        class="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData() ? () => void signOut() : () => void signIn()}
      >
        {sessionData() ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

const createSession = () => {
  return createServerData$(async (_, event) => {
    return await getSession(event.request, authOpts);
  });
};

const Home: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/questionares")}
      >
        Personal questions
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href="/stats/compare"
      >
        Compare
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/questionares")}
      >
        Stats
      </A>

      <AuthShowcase />
    </div>
  );
};

export default Home;
