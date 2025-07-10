"use client";

import { loginSchema } from "@/schemas/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/actions";
import { Field } from "@/types/field";
import DynamicForm from "@/components/ui/dynamic-form";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [err, setErr] = useState<{ error: string } | null>(null);
  const router = useRouter();

  const fields: Field[] = [
    { name: "email", label: "Email", type: "text" },
    {
      name: "password",
      label: "Password",
      type: "password",
      child: (
        <Link
          className="w-full pt-3 block text-right text-xs underline cursor-pointer"
          href="reset"
        >
          Forgot Password?
        </Link>
      ),
    },
  ];

  async function submitHandler(formData: z.infer<typeof loginSchema>) {
    const res = await login(formData);

    if(res.error){
      setErr(res)
    }else if(res.token){
      localStorage.setItem("access_token", res.token)
      router.push("/dashboard")
    }
  }

  return (
    <>
      {err && (
        <p className="bg-red-500/10 p-2 rounded-md mb-2 text-red-500 border solid border-red-500">
          {err?.error}
        </p>
      )}
      <DynamicForm
        form={form}
        fields={fields}
        onSubmit={submitHandler}
        content={
          <>
            Login to Dashboard <FaArrowRight />
          </>
        }
        contentClass={""}
      />
    </>
  );
}
