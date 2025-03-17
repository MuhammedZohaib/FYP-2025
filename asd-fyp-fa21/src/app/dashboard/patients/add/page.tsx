"use client";

import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import AddPatientForm from "../../../../components/add-patient-form";

export default function AddPatient() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-white flex items-center">
            <Home size={16} />
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">Add a patient</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-8">Add a patient</h1>

        {/* Form Container */}
        <div className="bg-[#0f0f0f] rounded-xl border border-gray-800">
          <AddPatientForm />
        </div>
      </div>
    </div>
  );
}
