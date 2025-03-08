"use client";

import { UseFormReturn, Path } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import AuthButton from "./auth-button";
import { z, ZodType } from "zod";
import { Field } from "@/types/field";

export default function DynamicForm<T extends Record<string, string | number>>({
  form,
  fields,
  onSubmit,
  content,
  contentClass,
  className,
}: {
  form: UseFormReturn<T>;
  fields: Field[];
  onSubmit: (data: z.infer<ZodType<T>>) => unknown;
  content: React.ReactNode;
    contentClass: string,
    className?: string
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`grid gap-4 ${className ?? ''}`}>
        {fields.map(({ name, type, label, child, className }) => (
          <div key={name} className={`${className ?? ''}`}>
            <FormField
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
          </div>
        ))}
        <AuthButton isLoading={form.formState.isSubmitting} className={contentClass}>
          {content}
        </AuthButton>
      </form>
    </Form>
  );
}
