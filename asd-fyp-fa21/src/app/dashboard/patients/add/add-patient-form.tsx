"use client";

import DynamicForm from "@/components/ui/dynamic-form";
import { Field } from "@/types/field";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { patientSchema } from "@/schemas/patient-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPatient } from "@/lib/patient-actions";
import { toast } from "sonner";
import { useState } from "react";

export default function AddPatientForm() {
  const [error, setError] = useState<{ error: string } | null>(null);

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      dob: undefined,
      email: "",
      phone: "",
      mother_name: "",
      mother_cnic: "",
      father_cnic: "",
      father_name: "",
      gender: "",
      other_info: "",
      address: "",
      born_city: "",
      born_country: "",
      asd: "",
    },
  });
  const fields: Field[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
    },
    {
      name: "gender",
      label: "Gender",
      type: {
        type: "select",
        options: [
          {
            value: "male",
            label: "Male",
          },
          {
            value: "female",
            label: "Female",
          },
        ],
      },
    },
    {
      name: "email",
      label: "E-mail",
      type: "text",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
    },
    {
      name: "mother_name",
      label: "Mother Name",
      type: "text",
    },
    {
      name: "mother_cnic",
      label: "Mother Cnic",
      type: "text",
    },
    {
      name: "father_name",
      label: "Father Name",
      type: "text",
    },
    {
      name: "father_cnic",
      label: "Father Cnic",
      type: "text",
    },
    {
      name: "dob",
      label: "Date of birth",
      type: "date",
    },
    {
      name: "born_city",
      label: "Born City",
      type: "text",
    },
    {
      name: "born_country",
      label: "Born Country",
      type: "text",
    },
    {
      name: "address",
      label: "Address",
      type: "text",
    },
    {
      name: "asd",
      label: "ASD Status",
      type: {
        type: "select",
        options: [
          {
            value: "true",
            label: "ASD",
          },
          {
            value: "false",
            label: "Non ASD",
          },
        ],
      },
    },
    {
      name: "other_info",
      label: "Other Information",
      type: "textarea",
      className: "col-span-2",
    },
  ];

  async function submitHandler(data: z.infer<typeof patientSchema>) {
    setError(null);
    const res = await addPatient(data, localStorage.getItem("access_token")!);
    console.log(res);
    if ("success" in res) {
      toast("Patient Added Successfully");
    }

    if (res.detail == "Email already registered") {
      setError({
        error: res.detail,
      });
    }
  }

  return (
    <>
      {error && (
        <p className="bg-red-500/10 p-2 rounded-md mb-2 text-red-500 border solid border-red-500">
          {error?.error}
        </p>
      )}
      <DynamicForm
        form={form}
        onSubmit={submitHandler}
        fields={fields}
        content="Add Patient"
        contentClass="col-span-2 text-white"
        className="grid grid-cols-2"
      />
    </>
  );
}
