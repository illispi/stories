import { ParentComponent, Setter, Show } from "solid-js";
import { Transition } from "solid-transition-group";
import CustomButton from "./CustomButton";
import clsx from "clsx";
import { Portal } from "solid-js/web";

export const ModalOptions: ParentComponent<{
	show: boolean;
	setShow: Setter<boolean>;
}> = (props) => {
	return (
		<Portal>
			{/* <Transition
        onEnter={(el, done) => {
          const a = el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 500,
            easing: "ease-in-out",
          });
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 500,
            easing: "ease-in-out",
          });
          a.finished.then(done);
        }}
      > */}
			{/* <Show when={props.show}> */}
			<div>
				<div
					onClick={() => {
						props.setShow(false);
					}}
					class={clsx(
						"fixed top-0 left-0 z-50 flex h-screen w-screen bg-black/30 transition-all duration-500",
						props.show
							? "visible opacity-100 backdrop-blur-sm"
							: "invisible opacity-0",
					)}
				/>

				<div
					class={clsx(
						"-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex w-full max-w-xl flex-col items-center justify-center transition-all duration-500",
						props.show ? "visible opacity-100" : "invisible opacity-0",
					)}
				>
					{/* <div class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
            <CustomButton
              class="bg-red-600 p-2 text-center hover:bg-red-900 focus:bg-red-900 active:bg-red-900"
              onClick={() => {
                props.setShow(false);
                document.body.style.overflow = "auto";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </CustomButton>
          </div> */}
					{props.children}
				</div>
			</div>
			{/* </Show> */}
			{/* </Transition> */}
		</Portal>
	);
};
