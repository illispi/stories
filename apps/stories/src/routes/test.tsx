import CustomButton from "~/components/CustomButton";
import { generateMock } from "@anatine/zod-mock";
import { personalQuestionsSchema } from "~/types/zodFromTypes";
import { postPersonalStats } from "~/server/mutations";

const Test = () => {
  const sendStatsPersonal = postPersonalStats();
  console.log(generateMock(personalQuestionsSchema))
  return (
    <>
      <CustomButton
        onClick={() =>
          sendStatsPersonal.mutateAsync(generateMock(personalQuestionsSchema))
        }
      >
        Send data
      </CustomButton>
    </>
  );
};

export default Test;
