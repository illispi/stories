import { createEffect, createSignal, Show } from "solid-js";
import type { ParentComponent, Setter } from "solid-js";
import CustomButton from "~/components/CustomButton";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions as questionsPersonal } from "~/data/personalQuestionsArr";
import type { QuestionTheir } from "~/data/theirQuestionsArr";
import { questions as questionsTheirs } from "~/data/theirQuestionsArr";
import { UnitQuestion } from "~/components/UnitQuestion";
import { useParams } from "solid-start";
import { Transition } from "solid-transition-group";
import { ModalOptions } from "~/components/ModalOptions";
import { trpc } from "~/utils/trpc";

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
  setSubmissionStatus: Setter<string>;
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
                          easing: "ease-in-out",
                        },
                        { opacity: 1, transform: "translate(0)" },
                      ],
                      {
                        duration: 600,
                      }
                    )
                  : el.animate(
                      [
                        {
                          opacity: 0,
                          transform: "translate(-340px)",
                          easing: "ease-in-out",
                        },
                        { opacity: 1, transform: "translate(0)" },
                      ],
                      {
                        duration: 600,
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
                          easing: "ease-in-out",
                        },
                        {
                          opacity: 0,
                          transform: "translate(340px)",
                        },
                      ],
                      {
                        duration: 600,
                      }
                    )
                  : el.animate(
                      [
                        {
                          opacity: 1,
                          transform: "translate(0)",
                          easing: "ease-in-out",
                        },
                        {
                          opacity: 0,
                          transform: "translate(-340px)",
                        },
                      ],
                      {
                        duration: 600,
                      }
                    );
              a.finished.then(done);
            }}
          >
            <Show when={props.page === 0 ? true : props.page} keyed>
              <div class="absolute z-30 flex h-full w-full flex-col rounded-3xl bg-white shadow-lg shadow-blue-400">
                <UnitQuestion
                  setSubmissionStatus={props.setSubmissionStatus}
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
  const [clear, setClear] = createSignal(false);

  const [submissionStatus, setSubmissionStatus] = createSignal("");

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
    <div class="flex h-screen w-full flex-col items-center justify-start lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      <Show
        when={submissionStatus() === "success"}
        fallback={
          <div class="flex h-screen w-full flex-col items-center justify-center">
            {console.log(submissionStatus(), "here")}
            <div class="flex w-11/12 max-w-2xl flex-col items-center justify-center gap-12 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
              <h2 class="m-8 text-lg">Submitted successfully for apporval!</h2>
            </div>
          </div>
        }
      >
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
            setSubmissionStatus={setSubmissionStatus}
            direction={direction()}
            page={page()}
            paginate={paginate}
            questions={questions}
            LsName={LsName}
          />
        </div>
        <CustomButton
          class="my-4 w-48"
          onClick={() => {
            setClear(true);
          }}
        >
          Clear answers
        </CustomButton>
        <ModalOptions show={clear()} setShow={setClear}>
          <div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
            <h2 class="text-center text-2xl font-bold lg:text-3xl">
              Clear all answers?
            </h2>

            <CustomButton
              class="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"
              onClick={() => {
                localStorage.clear();
                setClear(false);
                setPage(-1);
              }}
            >
              Clear answers
            </CustomButton>

            <CustomButton
              onClick={() => {
                setClear(false);
              }}
            >
              Cancel
            </CustomButton>
          </div>
        </ModalOptions>
      </Show>
    </div>
  );
};

export default PersonalQuestions;
