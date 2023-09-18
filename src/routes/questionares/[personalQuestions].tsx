import { createEffect, createSignal, Show } from "solid-js";
import type { ParentComponent } from "solid-js";
import CustomButton from "~/components/CustomButton";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions as questionsPersonal } from "~/data/personalQuestionsArr";
import type { QuestionTheir } from "~/data/theirQuestionsArr";
import { questions as questionsTheirs } from "~/data/theirQuestionsArr";
import { UnitQuestion } from "~/components/UnitQuestion";
import { useParams } from "solid-start";
import { Transition } from "solid-transition-group";

const Counter: ParentComponent<{
  page: number;
  questions: QuestionPersonal[] | QuestionTheir[];
}> = (props) => {
  return (
    <div class="flex max-h-12 items-center justify-center rounded-lg bg-blue-300 shadow-md">
      <h3 class="p-6 text-lg font-semibold">{`${Math.floor(
        ((props.page + 1) / props.questions.length) * 100
      )}%`}</h3>
    </div>
  );
};

const Questions: ParentComponent<{
  direction: number;
  page: number;
  paginate: (newDirection: number) => void;
  questions: QuestionPersonal[] | QuestionTheir[];
  LsName: "personalQuestions" | "theirQuestions";
}> = (props) => {
  return (
    <Show fallback={<div>Loading....</div>} when={props.page >= 0}>
      <Show
        fallback={<div>Done!!!</div>}
        when={props.page !== props.questions.length}
      >
        <div class="relative z-0 h-[600px] w-11/12 max-w-xs flex-col">
          {/*BUG During transition you should lock document from scrolling */}
          <Transition
            onEnter={(el, done) => {
              const a =
                props.direction > 0
                  ? el.animate(
                      [
                        {
                          opacity: 0,
                          transform: "translate(340px)",
                          easing: "ease-in",
                        },
                        { opacity: 1, transform: "translate(0)" },
                      ],
                      {
                        duration: 450,
                      }
                    )
                  : el.animate(
                      [
                        {
                          opacity: 0,
                          transform: "translate(340px)",
                          easing: "ease-in",
                        },
                        { opacity: 1, transform: "translate(0)" },
                      ],
                      {
                        duration: 450,
                      }
                    );
              a.finished.then(done);
            }}
            onExit={(el, done) => {
              const a =
                props.direction < 0
                  ? el.animate(
                      [
                        {
                          opacity: 1,
                          transform: "translate(0)",
                          easing: "ease-in",
                        },
                        {
                          opacity: 0,
                          transform: "translate(-340px)",
                        },
                      ],
                      {
                        duration: 450,
                      }
                    )
                  : el.animate(
                      [
                        {
                          opacity: 1,
                          transform: "translate(0)",
                          easing: "ease-in",
                        },
                        {
                          opacity: 0,
                          transform: "translate(-340px)",
                        },
                      ],
                      {
                        duration: 450,
                      }
                    );
              a.finished.then(done);
            }}
          >
            <Show when={props.page === 0 ? true : props.page} keyed>
              <div class="absolute z-30 flex h-full w-full flex-col rounded-3xl border-2 border-blue-300 bg-white">
                <UnitQuestion
                  content={props.questions[props.page]}
                  paginate={props.paginate}
                  LsName={props.LsName}
                />
              </div>
            </Show>
          </Transition>
        </div>
      </Show>
    </Show>
  );
};

const PersonalQuestions: ParentComponent = () => {
  const params = useParams<{
    personalQuestions: "personalQuestions" | "theirQuestions";
  }>();
  const [page, setPage] = createSignal(-1);
  const [direction, setDirection] = createSignal(1);

  const questions =
    params.personalQuestions === "personalQuestions"
      ? questionsPersonal
      : questionsTheirs;

  const LsName =
    params.personalQuestions === "personalQuestions"
      ? "personalQuestions"
      : "theirQuestions";

  //NOTE does this nedd to be memo or use on directive?

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setPage(page() + newDirection);
  };

  createEffect(() => {
    const pageNav = parseInt(localStorage.getItem(`page_${LsName}`) ?? "0");

    if (page() < 0) {
      setPage(pageNav === 0 ? 0 : pageNav);
      setDirection(1);
    } else {
      localStorage.setItem(`page_${LsName}`, JSON.stringify(page()));
    }
  });

  return (
    <div class="flex h-screen w-full lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <div class="flex h-full w-full flex-col items-center justify-start lg:h-5/6 lg:justify-center">
        <div class="flex h-20 w-80 items-center justify-between p-2">
          <Counter page={page()} questions={questions} />
          <CustomButton
            type="button"
            onClick={() => {
              if (page() >= 0) {
                const skipAmount = localStorage.getItem(
                  `to_${questions[page()].questionDB}_${LsName}`
                );

                paginate(skipAmount ? -1 - JSON.parse(skipAmount) : -1);
              }
            }}
          >
            Previous
          </CustomButton>
        </div>

        <Questions
          direction={direction()}
          page={page()}
          paginate={paginate}
          questions={questions}
          LsName={LsName}
        />
      </div>
    </div>
  );
};

export default PersonalQuestions;
