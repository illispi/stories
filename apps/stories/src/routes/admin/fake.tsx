import { Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { fakeForDev, fakeForFake } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const fakeForFakeMut = fakeForFake();
  const fakeForDevMut = fakeForDev();
  return (
    <Suspense>
      <div class="flex flex-col items-center gap-2">
        <CustomButton
          onClick={() =>
            fakeForDevMut.mutateAsync({ pOrT: "Personal_questions" })
          }
        >
          Personal
        </CustomButton>
        <CustomButton
          onClick={() => fakeForDevMut.mutateAsync({ pOrT: "Their_questions" })}
        >
          Their
        </CustomButton>
      </div>
    </Suspense>
  );
});

export default Page;
