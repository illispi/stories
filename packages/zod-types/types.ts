import { z } from "zod";

export const createUser = z.object({
  firstName: z.string().min(3),
  gender: z.enum(["female", "male", "other"]),
});

export type createUserType = z.infer<typeof createUser>;