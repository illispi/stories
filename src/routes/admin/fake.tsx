import { Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { fakeForDev, fakeForFake } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const fakeForFakeMut = fakeForFake();
  const fakeForDevMut = fakeForDev();
  return (
    <div>
      <Suspense>
        <div class="flex flex-col items-center gap-2">
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
        </div>
        <div class="flex flex-col items-center gap-2">
          <CustomButton
            onClick={() =>
              fakeForFakeMut.mutateAsync({ pOrT: "Personal_questions_fake" })
            }
          >
            Personal for fake
          </CustomButton>
          <CustomButton
            onClick={() =>
              fakeForFakeMut.mutateAsync({ pOrT: "Their_questions_fake" })
            }
          >
            Their for fake
          </CustomButton>
        </div>
      </Suspense>
    </div>
  );
});

export default Page;
