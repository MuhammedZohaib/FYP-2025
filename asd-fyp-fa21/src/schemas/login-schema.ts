import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});
