"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Field } from "@/types/field";
import { z } from "zod";
import { signupSchema } from "@/schemas/signup-schema";
import { signup } from "@/lib/actions";
import DynamicForm from "@/components/ui/dynamic-form";

export default function SignUpForm() {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      location: "",
      specialization: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const fields: Field[] = [
    { name: "name", label: "Name", type: "text", className: "col-span-2"},
    { name: "email", label: "Email", type: "email", className:"col-span-2" },
    {name: "specialization", label: "Specialization", type: "text", className: "col-span-2"},
    { name: "location", label: "Location", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "password", label: "Password", type: "password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password" },
  ];

  const submitHandler = async (data: z.infer<typeof signupSchema>) => {
    const res = await signup(data);

    if (res?.error)
      form.setError("email", {
        message: res.error,
      });
  };

  return (
    <DynamicForm
      form={form}
      fields={fields}
      onSubmit={submitHandler}
      content="Signup to Dashboard"
      contentClass="col-span-2"
      className="grid-cols-2"
    />
  );
}
