import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().nonempty("Name is required"),
  dob: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString().split("T")[0] : val),
    z.string().nonempty("Date of birth is required"),
  ),
  email: z.string().email().nonempty("Email is required"),
  phone: z.string().nonempty("Phone is required"),
  address: z.string().nonempty("Address is required"),
  gender: z.string().nonempty("Gender is required"),
  born_country: z.string().nonempty("Country is required"),
  born_city: z.string().nonempty("City is requied"),
  mother_name: z.string().nonempty("Mother's name is required"),
  mother_cnic: z.string().nonempty("Mother's cnic is required"),
  father_name: z.string().nonempty("Father's name is required"),
  father_cnic: z.string().nonempty("Father's cnic is required"),
  other_info: z.string(),
  asd: z
    .string()
    .nonempty("ASD status is required")
});
