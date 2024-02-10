import { getRequestEvent, isServer } from "solid-js/web";

const server = <T>(func: () => T): T => {
  "use server";
  return func({
    $fetch: {
      headers: getRequestEvent()
        ? {
            ...Object.fromEntries(getRequestEvent()?.request.headers),
          }
        : "",
    },
  });
};

const client = <T>(func: () => T): T => {
  return func();
};

export const serverFetch = <T>(func: () => T): T => {
  if (isServer) {
    return server(func);
  } else {
    return client(func);
  }
};
