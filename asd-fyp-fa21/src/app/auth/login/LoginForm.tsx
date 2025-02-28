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

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fields: Field[] = [
    { name: "email", label: "Email", type: "text" },
    {
      name: "password",
      label: "Password",
      type: "password",
      child: (
        <>
          <Link
            className="w-full pt-3 block text-right text-xs underline cursor-pointer"
            href="#"
          >
            Forgot Password?
          </Link>
        </>
      ),
    },
  ];

  return (
    <DynamicForm
      form={form}
      fields={fields}
      onSubmit={login}
      content={
        <>
          Login to Dashboard <FaArrowRight />
        </>
      }
    />
  );
}
