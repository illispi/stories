import { createQuery } from "@tanstack/solid-query";
import { Component } from "solid-js";
import { eden } from "~/app";
import { handleEden } from "~/utils";

const test: Component = (props) => {
  const authQuery = createQuery(() => ({
    queryKey: ["test"],
    queryFn: async () => handleEden(await eden.api.test.get()),
  }));
  // console.log(authQuery.data);

  return <div>{authQuery.data}</div>;
};

export default test;
