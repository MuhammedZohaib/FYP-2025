"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Search,
  Plus,
  ChevronLeft,
  ChevronLeftIcon as ChevronDoubleLeft,
  ChevronRightIcon as ChevronDoubleRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  asd: boolean;
  mother_name: string;
  mother_cnic: string;
  father_name: string;
  father_cnic: string;
  dob: string;
  gender: "male" | "female";
  born_country: string;
  born_city: string;
  other_info?: string;
  facial_data_records: any[];
  doctor: { _id: string; name: string };
  eeg_data_records: any[];
  speech_data_records: any[];
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:8000/api/patient/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken || "",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.statusText}`);
        }

        const data = await response.json();
        setPatients(data.patients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPatients = filteredPatients.length;
  const totalPages = Math.ceil(totalPatients / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalPatients);
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0].replace(/-/g, "-");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-4 px-3 sm:py-6 sm:px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6 overflow-hidden">
          <Link
            href="/"
            className="hover:text-white flex items-center shrink-0"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-white truncate">Patients List</span>
        </div>

        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Patients List
        </h1>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-[300px] md:w-[350px] lg:w-[400px]">
            <Input
              type="text"
              placeholder="Search Patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1a1a1a] border-gray-700 text-white pr-10"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus size={16} />
              <Link href={"/dashboard/patients/add"}>Add Patient</Link>
            </Button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-md overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Patient Name
                  </th>
                  <th className="hidden sm:table-cell text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    ASD Status
                  </th>
                  <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Guardian
                  </th>
                  <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Gender
                  </th>
                  <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Phone No.
                  </th>
                  <th className="hidden xl:table-cell text-left py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Date of Birth
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="border-b border-gray-800 hover:bg-gray-900/50"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-400 sm:hidden">
                          {patient.asd ? "Diagnosed" : "Not Diagnosed"}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            patient.asd ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></span>
                        {patient.asd ? "Diagnosed" : "Not Diagnosed"}
                      </div>
                    </td>
                    <td className="hidden md:table-cell py-3 px-4 whitespace-nowrap">
                      {patient.father_name}
                    </td>
                    <td className="hidden lg:table-cell py-3 px-4 whitespace-nowrap">
                      {patient.gender === "male" ? "Male" : "Female"}
                    </td>
                    <td className="hidden lg:table-cell py-3 px-4 whitespace-nowrap">
                      {patient.phone}
                    </td>
                    <td className="hidden xl:table-cell py-3 px-4 whitespace-nowrap">
                      {formatDate(patient.dob)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Link href={`/dashboard/patients/view/${patient._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye size={18} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 border-t border-gray-800 gap-3">
            <div className="text-sm text-gray-400 w-full sm:w-auto text-center sm:text-left">
              {startIndex + 1} to {endIndex} of {totalPatients} row(s)
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="hidden sm:inline">Rows per page</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-16 h-8 bg-[#1a1a1a] border-gray-700 text-white">
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400 hidden sm:block">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-gray-400"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronDoubleLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-gray-400"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-gray-400"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-gray-400"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronDoubleRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
