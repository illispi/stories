import { A } from "~/utils/router";
import { route as routeGen } from "~/utils/routes";
import { Suspense } from "solid-js";
import { withProviders } from "~/islands/withProviders";

const Page = () => {
	return (
		<Suspense>
			<div class="flex h-screen flex-col items-center justify-around">
				<A
					class="duration-200 ease-out active:scale-125"
					href={routeGen("/admin/adminCrud")}
				>
					Crud
				</A>
				<A
					class="duration-200 ease-out active:scale-125"
					href={routeGen("/admin/fake")}
				>
					Fake
				</A>
			</div>
		</Suspense>
	);
};

export default withProviders(Page);
