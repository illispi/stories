import {
  Field,
  Form,
  SubmitHandler,
  createForm,
  valiForm,
} from "@modular-forms/solid";
import { LuciaError } from "lucia";
import {
  ServerError,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { Input, maxLength, minLength, object, parse, string } from "valibot";
import { auth } from "~/auth/lucia";

//TODO redir to user data page if logged in

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
    maxLength(255, "Your password is too long, 255 characters max"),
  ]),
});

type UserForm = Input<typeof userSchema>;

const Login = () => {
  const [_, submit] = createServerAction$(async (formData: UserForm) => {
    try {
      const { username, password } = parse(userSchema, formData);

      // find user by key
      // and validate password
      const key = await auth.useKey(
        "username",
        username.toLowerCase(),
        password
      );
      if (key) {
        const session = await auth.createSession({
          userId: key.userId,
          attributes: {},
        });
        const sessionCookie = auth.createSessionCookie(session);
        // set cookie and redirect
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
          },
        });
      }

      //NOTE below is when signing up if, key not found

      const user = await auth.createUser({
        key: {
          providerId: "username", // auth method
          providerUserId: username.toLowerCase(), // unique id when using "username" auth method
          password, // hashed by Lucia
        },
        attributes: {
          username,
          role: "user",
        },
      });
      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      const sessionCookie = auth.createSessionCookie(session);
      // set cookie and redirect
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
        },
      });
    } catch (e) {
      if (
        e instanceof LuciaError &&
        (e.message === "AUTH_INVALID_KEY_ID" ||
          e.message === "AUTH_INVALID_PASSWORD")
      ) {
        // user does not exist
        // or invalid password
        throw new ServerError("Incorrect username or password");
      }
      if (
        e.message === "USER_TABLE_UNIQUE_CONSTRAINT_ERROR" //TODO see what to message is from kysely when using same name
      ) {
        throw new ServerError("Username already taken");
      }
      if (
        e.message === "USER_TABLE_UNIQUE_CONSTRAINT_ERROR" //TODO see what to message is from valibot when failing validation
      ) {
        throw new ServerError("Validation failed");
      }
      throw new ServerError("An unknown error occurred", {
        status: 500,
      });
    }
  });

  const [userForm, { Form, Field }] = createForm<UserForm>({
    validate: valiForm(userSchema),
  });
  const handleSubmit: SubmitHandler<UserForm> = async (values, event) => {
    //TODO serveraction

    submit(values);
  };

  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">Sign up/in</h1>
      <div class="mb-16 flex h-full w-full max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
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
          <br />
          <p class="text-lg font-semibold">
            These two sign up methods are separate, and you can't combine them
            into single account.
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
