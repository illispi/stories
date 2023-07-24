import CustomButton from "~/components/CustomButton";
import { postPersonalStats, postTheriStats } from "~/server/mutations";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { createFakeDataPersonal } from "~/utils/faker/personalQuestionsFaker";
import { createFakeDataTheir } from "~/utils/faker/theirQuestionsFaker";

const Test = () => {
  const sendStatsPersonal = postPersonalStats();
  const sendStatsTheir = postTheriStats();

  const submitPersonal = () => {
    try {
      const test = createFakeDataPersonal();

      personalQuestionsSchema.parse(test);
      return test;
    } catch (error) {
      console.log(error);
    }
  };
  const submitTheir = () => {
    try {
      const test = createFakeDataTheir();

      theirQuestionsSchema.parse(test);
      return test;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div class="flex flex-col">
      <CustomButton
        onClick={() => sendStatsPersonal.mutateAsync(submitPersonal)}
      >
        fake personal
      </CustomButton>
      <CustomButton onClick={() => sendStatsTheir.mutateAsync(submitTheir)}>
        fake their
      </CustomButton>
    </div>
  );
};

export default Test;
