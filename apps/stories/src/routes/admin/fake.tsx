import { Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { fake } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const fakeMut = fake();
  return (
    <Suspense>
      <div class="flex flex-col items-center gap-2">
        <CustomButton
          onClick={() => fakeMut.mutateAsync({ pOrT: "Personal_questions" })}
        >
          Personal
        </CustomButton>
        <CustomButton
          onClick={() => fakeMut.mutateAsync({ pOrT: "Their_questions" })}
        >
          Their
        </CustomButton>
      </div>
    </Suspense>
  );
});

export default Page;
