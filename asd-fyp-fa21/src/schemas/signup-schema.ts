import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().nonempty("Name is Required"),
    email: z
      .string()
      .nonempty("Email is required")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        {
            message: "Invalid Email"
        },
      ),
    password: z
      .string()
      .min(8, "Password must be 8 characters long!")
      .nonempty("Password is required"),
    confirmPassword: z.string(),
    location: z.string().nonempty("Location is required"),
    phone: z.string().nonempty("Phone Number is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });
