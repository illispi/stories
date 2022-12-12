import { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/router";
import { PersonalQuestions } from "zod-types";
import { AppRouter } from "../../../server/src/router";
import { questions } from "../utils/personalQuestionsArr";
import { trpc } from "../utils/trpc";

type DataBackEnd = inferRouterOutputs<AppRouter>;
//TODO might be better to get types from backend

const TextInput = () => {
  const router = useRouter();
  const textInput = router.query.textInput as keyof PersonalQuestions;

  //TODO might be better to get types from backend

  const personalStats = trpc.personalStats.useQuery();

  if (!personalStats.data) {
    return <h2>Loading...</h2>;
  }

  if (
    questions[questions.findIndex((e) => textInput === e.questionDB)]
      ?.questionType === "text"
  ) {
    return (
      <div className="mt-8 flex w-screen flex-col items-center justify-center">
        <div className="flex w-11/12 max-w-xs flex-col items-center justify-center md:max-w-prose">
          <h4 className="m-2 my-8 text-center text-xl underline underline-offset-8">{`${
            questions[questions.findIndex((e) => textInput === e.questionDB)]
              .question
          }`}</h4>
          {personalStats.data.map((e, i) => (
            <div
              className="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose "
              key={`${textInput}_${i}_div`}
            >
              <h5 className="m-2 my-8 font-bold" key={`${textInput}_${i}_h5`}>
                {i + 1}.
              </h5>
              <p className="w-full" key={`${textInput}_${i}_p`}>
                {e[textInput]}
              </p>
            </div>
          ))}
          <Link href={`/stats`}>
            <div
              className="m-2 mb-8 mt-8 rounded-full bg-blue-500 p-3
          font-semibold text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
            >
              Back to Stats
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return <p>Placeholder should be 404</p>;
};

export default TextInput;
