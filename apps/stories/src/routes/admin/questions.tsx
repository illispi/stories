import { For } from "solid-js";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { listSubmissions } from "~/server/admin";

export const { routeData, Page } = ProtectedAdmin((session) => {
  const submissions = listSubmissions({ page: 0 });

  return (
    <div class="flex flex-col items-center gap-2">
      <For each={submissions.data}>
        {(theirEntry) => (<div>{theirEntry}</div>)}
      </For>
    </div>
  );
});

export default Page;
