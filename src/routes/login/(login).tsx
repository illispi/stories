import {
	type SubmitHandler,
	createForm,
	getValue,
	valiForm,
} from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";

import { createEffect, createSignal } from "solid-js";

import {
	type Input,
	maxLength,
	minLength,
	object,
	parse,
	string,
	toTrimmed,
	excludes,
} from "valibot";
import CustomButton from "~/components/CustomButton";
import { ModalOptions } from "~/components/ModalOptions";
import ModalPopUp from "~/components/ModalPopUp";
import { trpc } from "~/utils/trpc";

const userSchema = object({
	username: string([
		excludes(" ", "The username can't contain spaces"),
		minLength(4, "Your username is too short, min 4 characters"),
		maxLength(30, "Your username is too long, 30 characters max"),
	]),
	password: string([
		excludes(" ", "The password can't contain spaces"),
		minLength(4, "Your password is too short, min 4 characters"),
		maxLength(255, "Your password is too long, 255 characters max"),
	]),
});

type UserForm = Input<typeof userSchema>;

const Login = () => {
	// const signUp = (password, username) => {
	// 	parse(userSchema, { password, username });
	// };

	const utils = trpc.useContext();

	// const [username, setUsername] = createSignal<null | string>(null);
	// const [password, setPassword] = createSignal<null | string>(null);
	//http://localhost:3000/api/trpc/authStatus

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	//TODO convert authQuery to server action, test first with default
	const authQuery = trpc.authStatus.createQuery();
	const signInMut = trpc.signIn.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));

	const signUpMut = trpc.signUp.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));

	createEffect(() => {
		if (authQuery.data?.user) {
			if (searchParams.redir) {
				navigate(searchParams.redir);
			} else {
				navigate("/");
			}
		}
	});

	const [userForm, { Form, Field }] = createForm<UserForm>({
		validate: valiForm(userSchema),
	});
	const handleSubmit: SubmitHandler<UserForm> = async (values, event) => {
		signInMut.mutate(values);
	};

	const [showAccountMissing, setShowAccountMissing] = createSignal(false);
	const [showIncorrect, setShowIncorrect] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	createEffect(() => {
		signInMut.data === "No account yet" ? setShowAccountMissing(true) : null;
		signInMut.data === "Incorrect username or password"
			? setShowIncorrect(true)
			: null;

		// submission.error?.message ? setError(submission.error.message) : null;
	});

	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<ModalPopUp message={error()} setMessage={setError} />
			<ModalOptions show={showAccountMissing()} setShow={setShowAccountMissing}>
				<div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
					<h2 class="text-center text-2xl font-bold lg:text-3xl">
						Create new account?
					</h2>

					<h3 class="text-center text-lg">No account found with username:</h3>
					<h4 class="text-center text-xl font-semibold">{`${getValue(
						userForm,
						"username",
					)}`}</h4>
					<CustomButton
						class="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
						disabled={signUpMut.isPending}
						onClick={() => {
							setShowAccountMissing(false);

							signUpMut.mutate({
								username: getValue(userForm, "username"),
								password: getValue(userForm, "password"),
							});
						}}
					>
						Create new account!
					</CustomButton>
					<CustomButton
						class="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"
						onClick={() => {
							setShowAccountMissing(false);
						}}
					>
						Cancel
					</CustomButton>
				</div>
			</ModalOptions>
			<ModalOptions show={showIncorrect()} setShow={setShowIncorrect}>
				<div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
					<h2 class="text-center text-2xl font-bold lg:text-3xl">
						Incorrect username or password
					</h2>

					<CustomButton
						class="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
						onClick={() => {
							setShowIncorrect(false);
						}}
					>
						Try again
					</CustomButton>
				</div>
			</ModalOptions>
			<h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">Sign up/in</h1>
			<div class="mb-16 flex h-full w-full md:w-11/12 max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
				<div class="flex w-11/12 max-w-2xl flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
					<h2 class="text-2xl font-bold lg:text-3xl">Username and password</h2>
					<p class="text-lg">
						Sign up/in with regular username and password. Use anonymous
						username. You can delete your account and all your data if you want
						at anytime. Remember to save username and password to
						browser/password manager, so that you can access account.
					</p>
					<br />
					<p class="text-lg font-semibold">
						Use this same form to sign in or up or both
					</p>
					<Form onSubmit={handleSubmit}>
						<div class="m-4 flex flex-col items-center justify-center gap-4">
							<label class="text-lg underline underline-offset-4">
								Username:
							</label>
							<Field name="username">
								{(field, props) => (
									<>
										<input
											class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
											{...props}
											required
											placeholder="username"
											autocomplete="off"
										/>
										{field.error && (
											<div class="text-red-600">{field.error}</div>
										)}
									</>
								)}
							</Field>
							<label class="text-lg underline underline-offset-4">
								Password:
							</label>
							<Field name="password">
								{(field, props) => (
									<>
										<input
											class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
											{...props}
											required
											placeholder="password"
											type="password"
											autocomplete="off"
										/>
										{field.error && (
											<div class="text-red-600">{field.error}</div>
										)}
									</>
								)}
							</Field>

							<button
								class="m-8 w-full max-w-xs flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
								type="submit"
							>
								Sign up/in
							</button>
						</div>
					</Form>
				</div>

				<div class="flex items-center justify-center">
					<h2 class="rounded-full border-2 border-fuchsia-500 p-12 text-4xl">
						OR
					</h2>
				</div>

				<div class="flex w-11/12 max-w-2xl flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
					<h2 class="text-2xl font-bold lg:text-3xl">
						Social media sign up/in
					</h2>
					<p class="text-lg">
						Sign up/in with social media provider. This site only requests
						openId, and doesn't save your email or username to database. But if
						you want to be on the safe side, you can just use previous username
						and password sign in. You can delete your account on this site at
						anytime.
					</p>
					<br />
					<p class="text-lg font-semibold">
						These two sign up methods are separate, and you can't combine them
						into single account.
					</p>
					{/* TODO Modal for options */}
					<div class="flex h-full items-center justify-center">
						<a
							class="m-8 flex-1 rounded-full border border-fuchsia-400 bg-white p-6 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
							href="/login/github"
						>
							Sign up/in
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
