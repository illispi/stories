import { A } from "@solidjs/router";
import { route } from "routes-gen";
import type { Component } from "solid-js";

const Footer: Component<{}> = (props) => {
	return (
		<footer class="sticky flex w-full items-center justify-center bg-fuchsia-800">
			<div class="flex w-full max-w-5xl flex-col items-center justify-around gap-8 py-16 md:flex-row md:items-start">
				<div class="flex flex-col items-center justify-center gap-4">
					<h5 class="m-4 border-white border-b text-3xl text-white">
						Contact me:
					</h5>

					<a
						class="text-white text-xl"
						href="https://github.com/illispi/stories"
					>
						Github
					</a>

					<a class="text-white text-xl" href="https://x.com/delvis1640088">
						Twitter
					</a>
				</div>
				<div class="flex flex-col items-center justify-around gap-4">
					<h5 class="m-4 border-white border-b text-3xl text-white">
						Jump to:
					</h5>
					<A
						class="rounded-xl border p-2 text-white text-xl"
						href="/privacyNotice"
					>
						Privacy notice
					</A>

					<A class="text-white text-xl" href={route("/pollResults")}>
						Poll results
					</A>
					<A class="text-white text-xl" href={route("/articles")}>
						Articles
					</A>
					<A class="text-white text-xl" href={route("/compare")}>
						Compare
					</A>
					<A class="text-white text-xl" href={route("/questionares")}>
						Poll
					</A>
				</div>
			</div>
		</footer>
	);
};
export default Footer;
