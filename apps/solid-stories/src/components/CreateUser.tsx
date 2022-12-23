import { createServerData$ } from "solid-start/server";
import { createOrGetUser } from "~/server/server";

const CreateUser: Component<{}> = (props) => {
  const data = createServerData$(async (_, { request }) =>
    createOrGetUser(request)
  );
  console.log(data());

  return null;
};

export default CreateUser;
