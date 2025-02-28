"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaArrowRight } from "react-icons/fa";
import { login } from "@/lib/actions";
import AuthButton from "@/components/ui/auth-button";

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(login)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Email</FormLabel>
              <FormControl>
                <Input {...field} type="text" className="py-4" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Password</FormLabel>
              <FormControl>
                <Input {...field} type="text" className="py-4" />
              </FormControl>
              <FormMessage />
              <Link
                className="w-full pt-3 block text-right text-xs underline cursor-pointer"
                href="#"
              >
                Forgot Password?
              </Link>
            </FormItem>
          )}
        />

        <AuthButton isLoading={form.formState.isSubmitting}>
          <p>Login to Dashboard</p> <FaArrowRight />
        </AuthButton>
        <Link href="signup" className="block w-full">
          <Button type="button" className="py-6 w-full">
            Signup to Dashboard
          </Button>
        </Link>
      </form>
    </Form>
  );
}
