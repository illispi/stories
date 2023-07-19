import { z } from "zod";

export const personalQuestionsSchema = z
  .object({
    diagnosis: z.enum(["schizophrenia", "schizoaffective"]),
    gender: z.enum(["other", "male", "female"]),
    current_age: z.number().int(),
    age_of_onset: z.number().int(),
    length_of_psychosis: z.enum([
      "few days",
      "few weeks",
      "few months",
      "more than 6 months",
    ]),
    hospitalized_on_first: z.boolean(),
    hospitalized_voluntarily: z.boolean().nullable(),
    hospital_satisfaction: z.boolean().nullable(),
    describe_hospital: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
    care_after_hospital: z.boolean().nullable(),
    what_kind_of_care_after: z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough'),
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.hospitalized_voluntarily !== null
      : data.hospitalized_voluntarily === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.hospital_satisfaction !== null
      : data.hospital_satisfaction === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.care_after_hospital !== null
      : data.care_after_hospital === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.care_after_hospital && data.what_kind_of_care_after !== null
      : data.care_after_hospital && data.what_kind_of_care_after === null;
  })
  .refine((data) => {
    return data.hospitalized_on_first
      ? data.describe_hospital !== null
      : data.describe_hospital === null;
  });
