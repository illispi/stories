import {
	type Component,
	For,
	Match,
	Show,
	Switch,
	createSignal,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import { ModalOptions } from "./ModalOptions";

const BellNotification = () => {
	const authQuery = trpc.authStatus.createQuery();
	const notificationsQuery = trpc.getNotifications.createQuery();

	const [showNotifications, setShowNotifications] = createSignal(false);
	return (
		<>
			<Show when={authQuery.data?.user}>
				<button
					type="button"
					class="w-12 h-12 transition-transform duration-200 ease-out hover:scale-125 active:scale-150"
					onClick={() => setShowNotifications(!showNotifications())}
				>
					<Show
						when={!notificationsQuery.data}
						fallback={
							<svg
								fill="currentColor"
								stroke-width="0"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								height="2em"
								width="2em"
								style="overflow: visible; color: currentcolor;"
							>
								<path d="M13.377 10.573a7.63 7.63 0 0 1-.383-2.38V6.195a5.115 5.115 0 0 0-1.268-3.446 5.138 5.138 0 0 0-3.242-1.722c-.694-.072-1.4 0-2.07.227-.67.215-1.28.574-1.794 1.053a4.923 4.923 0 0 0-1.208 1.675 5.067 5.067 0 0 0-.431 2.022v2.2a7.61 7.61 0 0 1-.383 2.37L2 12.343l.479.658h3.505c0 .526.215 1.04.586 1.412.37.37.885.586 1.412.586.526 0 1.04-.215 1.411-.586s.587-.886.587-1.412h3.505l.478-.658-.586-1.77zm-4.69 3.147a.997.997 0 0 1-.705.299.997.997 0 0 1-.706-.3.997.997 0 0 1-.3-.705h1.999a.939.939 0 0 1-.287.706zm-5.515-1.71.371-1.114a8.633 8.633 0 0 0 .443-2.691V6.004c0-.563.12-1.113.347-1.616.227-.514.55-.969.969-1.34.419-.382.91-.67 1.436-.837.538-.18 1.1-.24 1.65-.18a4.147 4.147 0 0 1 2.597 1.4 4.133 4.133 0 0 1 1.004 2.776v2.01c0 .909.144 1.818.443 2.691l.371 1.113h-9.63v-.012z" />
								<title>Bell Empty</title>
							</svg>
						}
					>
						<svg
							fill="currentColor"
							stroke-width="0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							height="2em"
							width="2em"
							style="overflow: visible; color: currentcolor;"
						>
							<path
								fill-rule="evenodd"
								d="M12.994 7.875A4.008 4.008 0 0 1 12 8h-.01v.217c0 .909.143 1.818.442 2.691l.371 1.113h-9.63v-.012l.37-1.113a8.633 8.633 0 0 0 .443-2.691V6.004c0-.563.12-1.113.347-1.616.227-.514.55-.969.969-1.34.419-.382.91-.67 1.436-.837.538-.18 1.1-.24 1.65-.18l.12.018c.182-.327.41-.625.673-.887a5.15 5.15 0 0 0-.697-.135c-.694-.072-1.4 0-2.07.227-.67.215-1.28.574-1.794 1.053a4.923 4.923 0 0 0-1.208 1.675 5.067 5.067 0 0 0-.431 2.022v2.2a7.61 7.61 0 0 1-.383 2.37L2 12.343l.479.658h3.505c0 .526.215 1.04.586 1.412.37.37.885.586 1.412.586.526 0 1.04-.215 1.411-.586s.587-.886.587-1.412h3.505l.478-.658-.586-1.77a7.63 7.63 0 0 1-.383-2.381v-.318ZM7.982 14.02a.997.997 0 0 0 .706-.3.939.939 0 0 0 .287-.705H6.977c0 .263.107.514.299.706.191.191.443.299.706.299Z"
								clip-rule="evenodd"
							/>
							<path d="M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
							<title>Bell Full</title>
						</svg>
					</Show>
				</button>
			</Show>

			<Show when={showNotifications()}>
				<ModalOptions setShow={setShowNotifications} show={showNotifications()}>
					<div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
						<h2 class="text-center text-2xl font-bold lg:text-3xl">
							Notifications
						</h2>
						<Show when={notificationsQuery.data?.personal}>
							{(item) => (
								<Notification
									seen={item().seen}
									time={item().time}
									status={item().status}
									name="Personal Poll"
								/>
							)}
						</Show>

						<For each={notificationsQuery.data?.their}>
							{(item) => (
								<Notification
									seen={item.seen}
									time={item.time}
									status={item.status}
									name="Other Poll"
								/>
							)}
						</For>
						<For each={notificationsQuery.data?.articles}>
							{(item) => (
								<Notification
									seen={item.seen}
									time={item.time}
									status={item.status}
									name="Articles"
								/>
							)}
						</For>
					</div>
				</ModalOptions>
			</Show>
		</>
	);
};

export default BellNotification;

const Notification: Component<{
	seen: boolean;
	time: Date;
	status: boolean | null;
	name: string;
}> = (props) => {
	return (
		<>
			<Show when={props.seen === false}>
				<div class="flex flex-col gap-4">
					<h3>{props.name}</h3>
					<p>{props.time.toLocaleDateString()}</p>
					<p>
						<Switch>
							<Match when={props.status === true}>Accepted</Match>
							<Match when={props.status === false}>Denied</Match>
							<Match when={props.status === null}>Pending review</Match>
						</Switch>
					</p>
				</div>
			</Show>
		</>
	);
};
