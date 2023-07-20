import CustomButton from "~/components/CustomButton";
import { postPersonalStats } from "~/server/mutations";
import { personalQuestionsSchema } from "~/types/zodFromTypes";
import { createFakeData } from "~/utils/mockUpDb";

const Test = () => {
  const sendStatsPersonal = postPersonalStats();

  const submit = () => {
    try {
      const test = createFakeData();
      console.log(test);

      personalQuestionsSchema.parse(test);
      return test;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <CustomButton onClick={() => sendStatsPersonal.mutateAsync(submit)}>
        Send data
      </CustomButton>
    </>
  );
};

export default Test;
