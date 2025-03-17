"use client";

import { UseFormReturn, Path } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import AuthButton from "./auth-button";
import { z, ZodType } from "zod";
import { Field } from "@/types/field";
import { DatePicker } from "./date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";

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
  contentClass: string;
  className?: string;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`grid gap-4 ${className ?? ""}`}
      >
        {fields.map(({ name, type, label, child, className }) => (
          <div key={name} className={`${className ?? ""}`}>
            <FormField
              name={name as Path<T>}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{label}</FormLabel>
                  {renderControl(type, field)}
                  <FormMessage />
                </FormItem>
              )}
            />
            {child}
          </div>
        ))}
        <AuthButton
          isLoading={form.formState.isSubmitting}
          className={contentClass}
        >
          {content}
        </AuthButton>
      </form>
    </Form>
  );
}

function renderControl(
  type: string | { type: string; options: { value: string; label: string }[] },
  field: any,
) {
  if (typeof type !== "string" && type) {
    return (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger className="w-full text-left">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
            {type.options.map(({ value, label }) => (
              <SelectItem key={value.toString()} value={value.toString()}>{label}</SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  }

  switch (type) {
    case "text":
    case "password":
    case "email":
      return <Input type={type} {...field} className="py-4" />;
    case "date":
      return <DatePicker field={field} />;
      case "textarea": 
      return <Textarea {...field} />
  }
}
