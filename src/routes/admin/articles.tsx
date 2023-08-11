import ProtectedAdmin from "~/components/ProtectedAdmin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  return (
    <div class="flex flex-col items-center gap-2">
      <h1>
        {session.user?.role} {session.user?.id}
      </h1>
    </div>
  );
});

export default Page;
