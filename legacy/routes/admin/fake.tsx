import { Show, Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";
import { trpc } from "~/utils/trpc";

export const { Page } = ProtectedAdmin((session) => {
	const fakeForFakeMut = trpc.fakeForFake.createMutation();
	const fakeForDevMut = trpc.fakeForDev.createMutation();
	const fakeArticlesForDevMut = trpc.fakeArticlesForDev.createMutation();
	return (
		<div>
			<Suspense>
				<div class="flex flex-col items-center gap-2">
					<Show when={import.meta.env.DEV === true}>
						<CustomButton
							disabled={fakeArticlesForDevMut.isPaused}
							onClick={() => fakeArticlesForDevMut.mutate()}
						>
							Articles for dev
						</CustomButton>
						<CustomButton
							onClick={() =>
								fakeForDevMut.mutate({ pOrT: "Personal_questions" })
							}
						>
							Personal for dev
						</CustomButton>
						<CustomButton
							onClick={() => fakeForDevMut.mutate({ pOrT: "Their_questions" })}
						>
							Their for dev
						</CustomButton>
					</Show>
				</div>
				<div class="flex flex-col items-center gap-2">
					<CustomButton
						disabled={fakeForFakeMut.isPending}
						onClick={() =>
							fakeForFakeMut.mutate({ pOrT: "Personal_questions_fake" })
						}
					>
						Fake for fake page, Personal
					</CustomButton>
					<CustomButton
						disabled={fakeForFakeMut.isPending}
						onClick={() =>
							fakeForFakeMut.mutate({ pOrT: "Their_questions_fake" })
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
