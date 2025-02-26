"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";

const inter = Inter();

export default function Login() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
    },
  });
  return (
    <>
      <h1 className={`mb-4 text-xl font-bold ${inter.className}`}>
        Welcom to EEG Prediction Dashboard
      </h1>
      <p>Login to EEG Prediction Dashboard</p>
      <Form {...form}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter your username"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </>
  );
}
