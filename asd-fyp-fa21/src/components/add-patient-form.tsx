"use client";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { patientSchema } from "@/schemas/patient-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPatient } from "@/lib/patient-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    <form onSubmit={form.handleSubmit(submitHandler)} className="p-6">
      {error && (
        <div className="bg-red-500/10 p-3 rounded-md mb-6 text-red-500 border border-red-500">
          {error?.error}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="mb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-6">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Enter Patient's Full Name"
              {...form.register("name")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="dob" className="block text-sm font-medium">
              Date of Birth
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-[#1a1a1a] border-gray-700 text-white",
                    !form.watch("dob") && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("dob")
                    ? format(new Date(form.watch("dob")!), "PPP")
                    : "Select Date of Birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-gray-700">
                <Calendar
                  mode="single"
                  selected={
                    form.watch("dob") ? new Date(form.watch("dob")!) : undefined
                  }
                  onSelect={(date) => form.setValue("dob", String(date))}
                  initialFocus
                  className="bg-[#1a1a1a] text-white"
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dob && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.dob.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium">
              Gender
            </label>
            <Select
              onValueChange={(value) => form.setValue("gender", value)}
              defaultValue={form.watch("gender")}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                <SelectValue placeholder="Select Gender (Male/Female)" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.gender && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.gender.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Address
            </label>
            <Input
              id="address"
              placeholder="Enter Full Address (Street, City, State, Zip Code)"
              {...form.register("address")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.address && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone
            </label>
            <div className="flex">
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-l-md px-3 flex items-center text-gray-400">
                +92
              </div>
              <Input
                id="phone"
                placeholder="3336382013"
                {...form.register("phone")}
                className="bg-[#1a1a1a] border-gray-700 text-white rounded-l-none"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Email Address (e.g., example@domain.com)"
              {...form.register("email")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="born_city" className="block text-sm font-medium">
              Born City
            </label>
            <Input
              id="born_city"
              placeholder="Enter City of Birth"
              {...form.register("born_city")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.born_city && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.born_city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="born_country" className="block text-sm font-medium">
              Born Country
            </label>
            <Input
              id="born_country"
              placeholder="Enter Country of Birth"
              {...form.register("born_country")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.born_country && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.born_country.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Parent Information Section */}
      <div className="mb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-6">
          Parent Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="father_name" className="block text-sm font-medium">
              Guardian Name
            </label>
            <Input
              id="father_name"
              placeholder="Enter Guardian's Name"
              {...form.register("father_name")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.father_name && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.father_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="father_cnic" className="block text-sm font-medium">
              Guardian NIC
            </label>
            <Input
              id="father_cnic"
              placeholder="Enter NIC Number (e.g., 12345-6789012-3)"
              {...form.register("father_cnic")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.father_cnic && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.father_cnic.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="mother_name" className="block text-sm font-medium">
              Mother Name
            </label>
            <Input
              id="mother_name"
              placeholder="Enter Mother's Name"
              {...form.register("mother_name")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.mother_name && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.mother_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="mother_cnic" className="block text-sm font-medium">
              Mother CNIC
            </label>
            <Input
              id="mother_cnic"
              placeholder="Enter Mother's CNIC"
              {...form.register("mother_cnic")}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {form.formState.errors.mother_cnic && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.mother_cnic.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="mb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-6">
          Additional Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="asd" className="block text-sm font-medium">
              ASD
            </label>
            <Select
              onValueChange={(value) => form.setValue("asd", value)}
              defaultValue={form.watch("asd")}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                <SelectValue placeholder="Yes" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                <SelectItem value="true">ASD</SelectItem>
                <SelectItem value="false">Non ASD</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.asd && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.asd.message}
              </p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label htmlFor="other_info" className="block text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="other_info"
              placeholder="Enter any additional information or notes about the patient (e.g., medical history, special requirements, observations)."
              {...form.register("other_info")}
              className="bg-[#1a1a1a] border-gray-700 text-white min-h-[120px]"
            />
            {form.formState.errors.other_info && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.other_info.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      >
        <Plus size={16} />
        Add Patient
      </Button>
    </form>
  );
}
