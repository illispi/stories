import type { Component } from "solid-js";
import { createServerData$ } from "solid-start/server";
import { createOrGetUser } from "~/server/server";

const CreateUser: Component<{}> = (props) => {
  createServerData$(async (_, { request }) => createOrGetUser(request));

  return null;
};

export default CreateUser;
