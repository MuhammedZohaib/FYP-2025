"use server";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";
import { User } from "../types/user";
import { redirect } from "next/navigation";
import { signupSchema } from "@/schemas/signup-schema";
import { cookies } from "next/headers";

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

  const _cookies = await cookies();

  const res = await fetch(`${endpoint}/doctor/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(result.data),
  });

  const json = await res.json();
  console.log("Login Response:", json);

  if (!("doctor" in json)) return { error: "Invalid Credentials" };

  _cookies.set({
    name: "access_token",
    value: json.token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { token: json.token };
}

export async function signup(data: z.infer<typeof signupSchema>) {
  const result = signupSchema.safeParse(data);
  if (!result.success) return { error: "Bad Request" };

  const { confirmPassword, ...dataToSend } = result.data;
  console.log(dataToSend);

  const res = await fetch(`${endpoint}/doctor/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  });

  if (res.status == 400)
    return { error: "Doctor with that email already exists" };

  console.log(res.statusText, res.status);

  if (res.status > 400) {
    console.log("Server Error");
    return;
  }

  redirect("/auth/login");
}

export async function validateToken() {
  const _cookies = await cookies();
  const access_token = _cookies.get("access_token");

  if (!access_token) return false;

  const res = await fetch(`${endpoint}/doctor/check-token`, {
    method: "GET",
    headers: {
      access_token: access_token?.value || "",
    },
  });

  const json = await res.json();

  if (json.success) return true;
  return false;
}

export async function logout() {
  const _cookies = await cookies();

  _cookies.set({
    name: "access_token",
    value: "",
    maxAge: 0,
  });

  redirect("/auth/login");
}
