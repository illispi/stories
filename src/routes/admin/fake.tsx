import { Show, Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { trpc } from "~/utils/trpc";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const fakeForFakeMut = trpc.fakeForFake.useMutation();
  const fakeForDevMut = trpc.fakeForDev.useMutation();
  const fakeArticlesForDevMut = trpc.fakeArticlesForDev.useMutation();
  return (
    <div>
      <Suspense>
        <div class="flex flex-col items-center gap-2">
          <Show when={import.meta.env.DEV === true}>
            <CustomButton onClick={() => fakeArticlesForDevMut.mutateAsync()}>
              Articles for dev
            </CustomButton>
            <CustomButton
              onClick={() =>
                fakeForDevMut.mutateAsync({ pOrT: "Personal_questions" })
              }
            >
              Personal for dev
            </CustomButton>
            <CustomButton
              onClick={() =>
                fakeForDevMut.mutateAsync({ pOrT: "Their_questions" })
              }
            >
              Their for dev
            </CustomButton>
          </Show>
        </div>
        <div class="flex flex-col items-center gap-2">
          <CustomButton
            onClick={() =>
              fakeForFakeMut.mutateAsync({ pOrT: "Personal_questions_fake" })
            }
          >
            Fake for fake page, Personal
          </CustomButton>
          <CustomButton
            onClick={() =>
              fakeForFakeMut.mutateAsync({ pOrT: "Their_questions_fake" })
            }
          >
            Fake for fake page, Their
          </CustomButton>
        </div>
      </Suspense>
    </div>
  );
});

export default Page;
