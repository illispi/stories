import {
  createContext,
  createEffect,
  createSignal,
  Show,
  useContext,
} from "solid-js";
import type { ParentComponent, Accessor } from "solid-js";
import { Motion, Presence } from "@motionone/solid";
import { Rerun } from "@solid-primitives/keyed";
import CustomButton from "~/components/CustomButton";
import { questions } from "~/data/personalQuestionsArr";

const Counter: ParentComponent<{ page: number }> = (props) => {
  return (
    <div class="my-4 flex max-h-12 items-center justify-center rounded-lg bg-blue-300 shadow-md">
      <h3 class="p-6 text-lg font-semibold">{`${Math.floor(
        ((props.page + 1) / questions.length) * 100
      )}%`}</h3>
    </div>
  );
};

const QuestionTransition: ParentComponent<{ direction: number }> = (props) => {
  return (
    <Motion.div
      class="absolute z-50 flex h-full w-full flex-col
  items-center justify-start overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-500 "
      initial={{ x: props.direction > 0 ? 340 : -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: props.direction < 0 ? 340 : -340, opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {props.children}
    </Motion.div>
  );
};

const Questions: ParentComponent<{ direction: number; page: number }> = (
  props
) => {
  return (
    <Show fallback={<div>Loading....</div>} when={props.page > 0}>
      <Show
        fallback={<div>Done!!!</div>}
        when={props.page !== questions.length}
      >
        <div class="relative z-0 flex h-4/6 max-h-[600px] w-11/12 max-w-xs flex-col items-center justify-center">
          <Presence>
            <Rerun on={props.page}>
              <QuestionTransition direction={props.direction}>
                <p>test</p>
                {/* <UnitQuestion key={page} content={questions[page]}/> */}
              </QuestionTransition>
            </Rerun>
          </Presence>
        </div>
      </Show>
    </Show>
  );
};

const PersonalQuestions: ParentComponent = () => {
  const [page, setPage] = createSignal(-1);
  const [direction, setDirection] = createSignal(1);

  //NOTE does this nedd to be memo or use on directive?

  const paginate = (newDirection: number) => {
    setPage(page() + newDirection);
    setDirection(newDirection);
  };

  createEffect(() => {
    const pageNav = parseInt(localStorage.getItem("page") ?? "0");

    if (page() < 0) {
      setPage(pageNav === 0 ? 0 : pageNav);
      setDirection(1);
    } else {
      localStorage.setItem("page", JSON.stringify(page()));
    }
  });

  return (
    <div class="flex h-screen flex-col items-center justify-start">
      {/* BUG cant have hard coded widths */}
      <div class="flex h-1/6 w-[320px] items-end justify-between p-2">
        <Counter page={page()} />
        <CustomButton
          type="button"
          class="my-4 max-h-12"
          onClick={() => {
            if (page() >= 0) {
              const skipAmount = localStorage.getItem(
                `to_${questions[page()].questionDB}`
              );

              paginate(skipAmount ? -1 - JSON.parse(skipAmount) : -1);
            }
          }}
        >
          Previous
        </CustomButton>
      </div>

      <Questions direction={direction()} page={page()} />
      <div class="mb-10" />
    </div>
  );
};

export default PersonalQuestions;
