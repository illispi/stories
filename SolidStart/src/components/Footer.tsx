import { route } from "routes-gen";
import { Component } from "solid-js";
import { A } from "solid-start";

const Footer: Component<{}> = (props) => {
  return (
    <footer class="sticky flex w-full items-center justify-center bg-fuchsia-800">
      <div class="flex w-full max-w-5xl flex-col items-center justify-around gap-8 py-16 md:flex-row md:items-start">
        <div class="flex flex-col items-center justify-center gap-4">
          <h5 class="m-4 border-b border-white text-3xl text-white">
            Contact me:
          </h5>

          <a
            class="text-xl text-white"
            href="https://github.com/illispi/stories"
          >
            Github
          </a>
        </div>
        <div class="flex flex-col items-center justify-around gap-4">
          <h5 class="m-4 border-b border-white text-3xl text-white">
            Jump to:
          </h5>
          <A class="text-xl text-white" href={route("/")}>
            Home
          </A>
          <A class="text-xl text-white" href={route("/pollResults")}>
            Poll results
          </A>
          <A class="text-xl text-white" href={route("/articles")}>
            Articles
          </A>
          <A class="text-xl text-white" href={route("/compare")}>
            Compare
          </A>
          <A class="text-xl text-white" href={route("/questionares")}>
            Poll
          </A>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
