import { createQuery } from "@tanstack/solid-query";
import { Component, Suspense } from "solid-js";
import { eden } from "~/app";
import { handleEden } from "~/utils";

const test: Component = (props) => {
  const authQuery = createQuery(() => ({
    queryKey: ["test"],
    queryFn: async () => handleEden(await eden.api.test.get()),
  }));

  return (
    <div>
      <Suspense>{authQuery.data}</Suspense>
    </div>
  );
  // return <div>Hello</div>;
};

export default test;
