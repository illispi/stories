import { createQuery } from "@tanstack/solid-query";
import { Component, Show, Suspense } from "solid-js";
import { eden } from "~/app";
import { handleEden } from "~/utils/handleEden";

const test: Component = (props) => {
  const authQuery = createQuery(() => ({
    queryKey: ["test"],
    // queryFn: async () => {
    //   const test = handleEden(await eden.api.test.get());
    //   return test;
    // },
    // queryFn: async () => {
    //   await new Promise((resolve, _reject) => {
    //     setTimeout(resolve, 1000);
    //   });
    //   return "test";
    // },
    queryFn: async () => {
      const data = await fetch("https://jsonplaceholder.typicode.com/posts");
      const test = await data.json();
      return test;
    },
  }));

  return (
    <div>
      <Suspense fallback="fallback">
        {/* <Show when={authQuery.data}>{(test) => <p>{test()[0].id}</p>}</Show> */}
        <Show when={authQuery.data}>{(test) => <p>{test()}</p>}</Show>
      </Suspense>
    </div>
  );
  // return <div>Hello</div>;
};

export default test;
