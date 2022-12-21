import { Presence } from "@motionone/solid";
import {
  createContext,
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
  useContext,
} from "solid-js";
import CustomButton from "~/components/CustomButton";
import { questions } from "~/data/personalQuestionsArr";

const PaginationContext = createContext();
const usePagination = () => {
  return useContext(PaginationContext);
};

const Counter = () => {
  const { page } = usePagination();

  return (
    <div class="my-4 flex max-h-12 items-center justify-center rounded-lg bg-blue-300 shadow-md">
      <h3 class="p-6 text-lg font-semibold">{`${Math.floor(
        ((page() + 1) / questions.length) * 100
      )}%`}</h3>
    </div>
  );
};

const Questions = () => {
  const { direction, page, paginate } = useContext(paginationContext);

  return (
    <Show fallback={<div>Loading....</div>} when={page() > 0}>
      <Show fallback={<div>Done!!!</div>} when={page() !== questions.length}>
        <div class="relative z-0 flex h-4/6 max-h-[600px] w-11/12 max-w-xs flex-col items-center justify-center">
          <Presence custom={direction}>
            <QuestionTransition key={page} direction={direction}>
              <UnitQuestion key={page} content={questions[page]}></UnitQuestion>
            </QuestionTransition>
          </Presence>
        </div>
      </Show>
    </Show>
  );
};

const PersonalQuestions = () => {
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
    <>
      <PaginationContext.Provider value={{ page, direction, paginate }}>
        <div class="flex h-screen flex-col items-center justify-start">
          {/* BUG cant have hard coded widths */}
          <div class="flex h-1/6 w-[320px] items-end justify-between p-2">
            <Counter />
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

          <Questions></Questions>
          <div class="mb-10" />
        </div>
      </PaginationContext.Provider>
    </>
  );
};

export default PersonalQuestions;
