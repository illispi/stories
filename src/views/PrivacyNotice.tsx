const PrivacyNotice = () => {
	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<h1 class="my-16 font-bold text-5xl lg:mt-48 lg:text-6xl">
				Privacy notice
			</h1>
			<div class="mb-16 flex h-full w-full max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 md:w-11/12 lg:flex-row lg:items-stretch">
				<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
					<p class="text-lg">
						You sign in with Discord. This site only stores your Discord account
						ID, which links your account to your poll answers and articles. Your
						Discord email, username, avatar and access tokens are not saved, and
						neither are your IP address or browser details.
					</p>
					<p class="text-lg">
						Don't write identifiable information into the polls' text fields.
						Submitted answers and articles are reviewed before they are shown
						publicly. You can delete your account and all your data at any time
						on the "Your data" page.
					</p>
					<p class="text-lg">
						While you're signed in, unfinished poll answers are saved to your
						account so you can continue on another device. They're deleted when
						you submit or clear the poll, and you can delete them on "Your data".
						Which articles you voted helpful is stored too, but only the vote
						count is shown. On "Your data" you can also download everything
						stored about your account.
					</p>
					<p class="text-lg">
						The database is backed up to Backblaze. Backups are kept for 3 months,
						so data you delete is gone from the backups too within 3 months.
					</p>
					<p class="text-lg">
						This is a non-commercial project with no commercial interest. Your
						data is not sold or used for advertising.
					</p>
					<p class="text-lg">
						The site is served through Cloudflare, which processes visitors' IP
						addresses for security and rate limiting. Anonymous visit statistics
						are collected with Cloudflare Web Analytics, which uses no cookies and
						doesn't store IP addresses. Errors are reported to Sentry, without IP
						addresses or other personal data.
					</p>
					<p class="text-lg">
						If you lose access to your Discord account, message me on Reddit with
						a snippet of your poll or article text so I can remove the correct
						account and data.
					</p>
					<a
						class="mx-auto text-blue-900 text-xl"
						href="https://www.reddit.com/user/Delvisreddit/"
					>
						Reddit
					</a>
				</div>
			</div>
		</div>
	);
};

export default PrivacyNotice;
