import { Motion, Presence } from "@motionone/solid";
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import PieChartCustom from "~/components/PieChartCustom";
import { personalStatsGet } from "~/server/server";

const Tab = (props) => <p ref={props.ref}>This is a Paragraph</p>;

const Test = () => {
  const [targets, setTargets] = createSignal<Element[]>([]);

  createIntersectionObserver(targets, (entries) => {
    entries.forEach((e) => console.log(e.isIntersecting));
  });

  return (
    <>
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <Tab ref={(el) => setTargets((p) => [...p, el])} />
      <div>efsgfes</div>
    </>
  );
};

export default Test;
