const PrivacyNotice = () => {
	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<h1 class="my-16 font-bold text-5xl lg:mt-48 lg:text-6xl">
				Privacy notice
			</h1>
			<div class="mb-16 flex h-full w-full max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 md:w-11/12 lg:flex-row lg:items-stretch">
				<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
					<p class="text-lg">
						If you use unique username and password you don't use on other
						websites and you don't write identifiable info into polls text
						fields, there is no risk in terms of data breach since there is
						nothing important to lose. If you log in using social media
						providers only openId is saved into database, so even in that case
						nothing important should get lost. You can delete account and data
						at any point easily.
					</p>
					<p class="text-lg">
						If you forget your username or password just direct message me on
						twitter with snippet of polls or articles text field so you I can
						remove the correct account and data.
					</p>
					<a
						class="mx-auto text-blue-900 text-xl"
						href="https://x.com/delvis1640088"
					>
						Twitter
					</a>
				</div>
			</div>
		</div>
	);
};

export default PrivacyNotice;
