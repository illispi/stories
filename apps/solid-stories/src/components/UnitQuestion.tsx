import type { ParentComponent } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { PersonalQuestions } from "zod-types";
import { QuestionPersonal, questions } from "~/data/personalQuestionsArr";
import { personalStatsPost } from "~/routes/api/server";

const Box: ParentComponent<{ question: string }> = (props) => {
  return (
    <div class="flex grow flex-col">
      <div class="flex h-24 w-80 items-center justify-center bg-blue-300 p-8">
        <label class=" text-center font-semibold">{props.question}</label>
      </div>
      <div class="relative flex grow flex-col items-center justify-start overflow-hidden overflow-y-auto">
        <div class="absolute my-2 flex w-72 flex-col items-center justify-end ">
          {props.children}
        </div>
      </div>
    </div>
  );
};

const firstLetterUpperCase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const LsName = "personalQuestions";

export const UnitQuestion: ParentComponent<{
  content: QuestionPersonal;
  paginate: (newDirection: number) => void;
}> = (props) => {

const [sendingData, sendData] = createServerAction$(async (data) => {await personalStatsPost(data) })

  const {
    question,
    questionDB,
    questionType,
    selections,
    multiSelect,
    skip,
  } = props.content;

  let questionsLs: PersonalQuestions = JSON.parse(
    localStorage.getItem(LsName) ?? "{}"
  );

  const valueOfLS = questionsLs[questionDB] ?? "";

  const submitResults = () => {
    (Object.keys(questionsLs) as Array<keyof PersonalQuestions>).forEach(
      (e) => {
        if (
          questions.find((el) => el.questionDB === e)?.questionType ===
          "integer"
        ) {
          (questionsLs as unknown as Record<keyof PersonalQuestions, number>)[ //TODO this as unknown has to have something better
            e
          ] = Number(questionsLs[e]); //NOTE is this as number really good practice?
        }
      }
    );

    const array2 = Object.keys(questionsLs);
    questions
      .map((k) => k.questionDB)
      .filter((j) => !array2?.includes(j))
      .forEach((s) => {
        (questionsLs[s] as null) = null;
      });

    questions
      .filter((e) => e.multiSelect)
      .map((e) => e.multiSelect?.map((el) => el[0]))
      .flat()
      .filter((j) => !array2?.includes(j ? j : "")) //BUG there might be a bug here
      .forEach((e) => (e ? ((questionsLs[e] as boolean) = false) : null));

    sendResults.mutate(questionsLs);}



  return <div></div>;
};
