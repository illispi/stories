import { route } from "routes-gen";
import { A } from "solid-start";
import ProtectedAdmin from "~/components/ProtectedAdmin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/admin/adminCrud")}
      >
        Crud
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/admin/fake")}
      >
        Fake
      </A>
    </div>
  );
});

export default Page;
