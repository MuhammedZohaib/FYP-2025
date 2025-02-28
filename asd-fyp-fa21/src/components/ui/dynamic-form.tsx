"use client";

import { UseFormReturn, Path } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import AuthButton from "./auth-button";
import { z, ZodType } from "zod";

export default function DynamicForm<T extends Record<string, string | number>>({
  form,
  fields,
  onSubmit,
}: {
  form: UseFormReturn<T>;
  fields: { name: string; type: string; label: string }[];
  onSubmit: (data: z.infer<ZodType<T>>) => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {fields.map(({ name, type, label, child }) => (
          <>
            <FormField
              key={name}
              name={name as Path<T>}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{label}</FormLabel>
                  <Input type={type} {...field} className="py-4" />
                  <FormMessage />
                </FormItem>
              )}
            />
            {child}
          </>
        ))}
        <AuthButton isLoading={form.formState.isSubmitting}>
          Signup to Dashboard
        </AuthButton>
      </form>
    </Form>
  );
}
