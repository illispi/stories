import { createQuery } from "@tanstack/solid-query";
import { Component, Show, Suspense } from "solid-js";
import { eden } from "~/app";
import { handleEden } from "~/utils";

const test: Component = (props) => {
  const authQuery = createQuery(() => ({
    queryKey: ["test"],
    queryFn: async () => {
      await new Promise((resolve, _reject) => {
        setTimeout(resolve, 1000);
      });
      return "test";
    },
    // queryFn: async () => {
    //   const data = await fetch("https://jsonplaceholder.typicode.com/posts");
    //   return data.json();
    // },
  }));

  return (
    <div>
      <Suspense>
        <Show when={authQuery.data}>{authQuery.data}</Show>
      </Suspense>
    </div>
  );
  // return <div>Hello</div>;
};

export default test;
