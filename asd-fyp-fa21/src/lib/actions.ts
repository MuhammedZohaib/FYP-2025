"use server";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";

const endpoint = "http://localhost:8000";

export async function login(data: z.infer<typeof loginSchema>) {
  await new Promise((res) => setTimeout(res, 3000));
  const result = loginSchema.safeParse(data);
  if (!result.success) return result.error;
  console.log(result.data);
}
