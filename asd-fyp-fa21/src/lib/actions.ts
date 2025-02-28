"use server";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";

const endpoint = "http://localhost:8000";

type Login = z.infer<typeof loginSchema>;

export async function login(formValue: Login) {
  await new Promise((res) => setTimeout(res, 3000));
  const result = loginSchema.safeParse(formValue);
  if (!result.success) return result.error;
  console.log(result.data);
}
