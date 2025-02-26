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

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmitForm(values: z.infer<typeof loginSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="grid gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Email</FormLabel>
              <FormControl>
                <Input {...field} type="text" className="py-6" />
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
                <Input {...field} type="text" className="py-6" />
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

        <Button
          type="submit"
          className="bg-[#3476EF] hover:bg-[#3476EF]/90 py-6"
        >
          Login to Dashboard <FaArrowRight />
        </Button>
        <Button className="py-6" type="button">
          Signup for the account
        </Button>
      </form>
    </Form>
  );
}
