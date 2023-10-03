import {
  Field,
  Form,
  SubmitHandler,
  createForm,
  valiForm,
} from "@modular-forms/solid";
import { createServerData$, redirect } from "solid-start/server";
import { Input, maxLength, minLength, object, string } from "valibot";
import { auth } from "~/auth/lucia";

// export const routeData = () => {
// 	return createServerData$(async (_, event) => {
// 		const authRequest = auth.handleRequest(event.request);
// 		const session = await authRequest.validate();
// 		if (session) {
// 			return redirect("/");
// 		}
// 	});
// };

const userSchema = object({
  username: string([
    minLength(4, "Your username is too short, min 4 characters"),
    maxLength(30, "Your username is too long, 30 characters max"),
  ]),
  password: string([
    minLength(4, "Your password is too short, min 4 characters"),
    maxLength(30, "Your password is too long, 30 characters max"),
  ]),
});

type UserForm = Input<typeof userSchema>;

const Login = () => {
  const [userForm, { Form, Field }] = createForm<UserForm>({
    validate: valiForm(userSchema),
  });
  const handleSubmit: SubmitHandler<UserForm> = async (values, event) => {
    //TODO serveraction
  };

  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">Sign up/in</h1>
      <div class="mb-16 flex h-full w-11/12 max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
        <div class="flex w-11/12 max-w-2xl flex-col justify-start gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
          <h2 class="text-2xl font-bold lg:text-3xl">Username and password</h2>
          <p class="text-lg">
            Sign up/in with regular username and password. Use anonymous
            username. You can delete your account and all your data if you want
            at anytime. Remember to save username and password to
            browser/password manager, so that you can access account.
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
                    />
                    {field.error && <div>{field.error}</div>}
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
                    />
                    {field.error && <div>{field.error}</div>}
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

        <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
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
          {/* TODO Modal for options */}
          <div class="flex items-center justify-center">
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
