import Protected from "~/components/ProtectedAdmin";

export const { routeData, Page } = Protected((session) => {
  return (
    <main class="flex flex-col items-center gap-2">
      <h1>{session.user?.role}</h1>
    </main>
  );
});

export default Page;
