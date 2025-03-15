"use client";

import { loginSchema } from "@/schemas/login-schema";
import { z } from "zod";
import { User } from "../types/user";
import { redirect, useRouter } from "next/navigation";
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
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(result.data),
  });

  const json = await res.json();
  console.log("Login Response:", json);

  if (!("doctor" in json)) return { error: "Invalid Credentials" };

  if (typeof window !== "undefined") {
    console.log("Storing token:", json.token);
    localStorage.setItem("access_token", json.token);
  } else {
    console.warn("Local storage is not available.");
  }

  redirect("/dashboard");
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
