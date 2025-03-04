"use server";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";
import { cookies } from "next/headers";
import { User } from "../types/user";
import { redirect } from "next/navigation";

const endpoint = "http://localhost:8000/api";

type LoginResponseSuccess = {
  detail: string;
  token: string;
  doctor: User;
  success: boolean;
};

type LoginResponseError = {
  status: string;
  detail: string;
};

export async function login(data: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse(data);
  if (!result.success) return result.error;

  const res = await fetch(`${endpoint}/login/doctor`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(result.data),
  });
  const json: LoginResponseSuccess | LoginResponseError = await res.json();

  if (!("doctor" in json)) {
    return null;
  }

  const _cookies = await cookies();
  _cookies.set("access_token", json.token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  redirect("/dashboard");
}
