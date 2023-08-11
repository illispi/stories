// export const routeData = () => {
// 	return createServerData$(async (_, event) => {
// 		const authRequest = auth.handleRequest(event.request);
// 		const session = await authRequest.validate();
// 		if (session) {
// 			return redirect("/");
// 		}
// 	});
// };

const Login = () => {
  return (
    <div class="flex h-full w-full flex-col items-center justify-center">
      <h1>Sign in</h1>
      <a href="/login/github">Sign in with Github</a>
    </div>
  );
};

export default Login;
