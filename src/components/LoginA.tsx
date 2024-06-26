import type { Component } from "solid-js";
import CustomButton from "./CustomButton";
import { useLocation, useNavigate } from "@solidjs/router";

const LoginA: Component = (props) => {
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<CustomButton
			class="w-44"
			onClick={() => {
				navigate(`/login/?redir=${location.pathname}`);
			}}
		>
			Sign up/in
		</CustomButton>
	);
};

export default LoginA;
