"use client";

import { useState, useEffect } from "react";
import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "./ui/skeleton";

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

export function PatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Assuming the API returns the patients array in order of recency,
        // we store it and later only display the first 5 entries.
        setPatients(data.patients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center space-x-4 py-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <DataTable>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>ASD Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.slice(0, 5).map((patient) => (
          <TableRow key={patient._id}>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{calculateAge(patient.dob)}</TableCell>
            <TableCell>{patient.gender}</TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell>{patient.asd ? "ASD" : "Non-ASD"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}
