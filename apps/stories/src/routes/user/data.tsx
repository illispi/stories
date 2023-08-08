import { ErrorBoundary, Show, Suspense } from "solid-js";
import { ErrorMessage, Navigate } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import CustomButton from "~/components/CustomButton";
import ProtectedUser from "~/components/ProtectedUser";
import { removeAccountAndData } from "~/server/user";

export const { routeData, Page } = ProtectedUser((session) => {
  //TODO DELETE ACCOUNT
  //TODO DELETE PERSONAL AND MULTIPLE THEIR
  //TODO EDIT TOO PERSONAL TEXT

  const removeAccAndDataMut = removeAccountAndData();

  return (
    <div class="flex flex-col items-center justify-start">
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary
          fallback={(e) => (
            <Show when={e.message === "Session not found"}>
              <HttpStatusCode code={e.status} />
              <ErrorMessage error={e} />
            </Show>
          )}
        >
          <Show when={removeAccAndDataMut.isSuccess}>
            <Navigate href={"/"} />
          </Show>
          <CustomButton
            onClick={() => {
              removeAccAndDataMut.mutateAsync();
            }}
          >
            Delete account and data
          </CustomButton>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

export default Page;
