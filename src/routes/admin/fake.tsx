import { Show, Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import {
  fakeArticlesForDev,
  fakeForDev,
  fakeForFake,
} from "~/server/admin/adminMutations";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const fakeForFakeMut = fakeForFake();
  const fakeForDevMut = fakeForDev();
  const fakeArticlesForDevMut = fakeArticlesForDev();
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
