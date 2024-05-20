import { A } from "@solidjs/router";
import { route as routeGen } from "routes-gen";
import { Suspense } from "solid-js";
import ProtectedAdmin from "~/components/ProtectedAdmin";

export const { route, Page } = ProtectedAdmin((session) => {
	return (
		<Suspense>
			<div class="flex h-screen flex-col items-center justify-around">
				<A
					noScroll={true}
					class="duration-200 ease-out active:scale-125"
					href={routeGen("/admin/adminCrud")}
				>
					Crud
				</A>
				<A
					noScroll={true}
					class="duration-200 ease-out active:scale-125"
					href={routeGen("/admin/fake")}
				>
					Fake
				</A>
			</div>
		</Suspense>
	);
});

export default Page;
