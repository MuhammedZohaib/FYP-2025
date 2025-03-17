"use server";

import { patientSchema } from "@/schemas/patient-schema";
import { z } from "zod";

const endpoint = "http://localhost:8000/api";

export async function addPatient(
  data: z.infer<typeof patientSchema>,
  token: string,
) {
  const result = patientSchema.safeParse(data);

  if (!result.success) return { error: result.error };

  console.log(result.data)

  const res = await fetch(`${endpoint}/patient/new`, {
    method: "POST",
    headers: { "content-type": "application/json", access_token: token },
    body: JSON.stringify(result.data),
  });

  const json = await res.json();
  console.log(json)
  return json;
}
