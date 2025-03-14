"use server";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";
import { cookies } from "next/headers";
import { User } from "../types/user";
import { redirect } from "next/navigation";
import { signupSchema } from "@/schemas/signup-schema";

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
  if (!result.success) return { error: "Invalid Credentials" };

  const res = await fetch(`${endpoint}/doctor/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(result.data),
  });

  console.log(res);

  const json: LoginResponseSuccess | LoginResponseError = await res.json();

  if (!("doctor" in json)) return { error: "Invalid Credentials" };

  const _cookies = await cookies();
  _cookies.set("access_token", json.token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  redirect("/dashboard");
}

export async function signup(data: z.infer<typeof signupSchema>) {
  const result = signupSchema.safeParse(data);
  if (!result.success) return { error: "Bad Request" };

  const res = await fetch(`${endpoint}/doctor/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(result.data),
  });

  if (res.status == 400)
    return { error: "Doctor with that email already exists" };

  if (res.status > 400) {
    console.log("Server Error");
    return;
  }

  redirect("/auth/login");
}
