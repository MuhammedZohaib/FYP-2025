"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "./ui/skeleton";

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  date: string;
}

export function PatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        // You would typically have a separate endpoint for patients data
        // For now, we'll create sample data based on the current date
        const samplePatients: Patient[] = [
          {
            id: 1,
            name: "John Doe",
            age: 7,
            gender: "Male",
            diagnosis: "ASD",
            date: new Date().toISOString().split("T")[0],
          },
          {
            id: 2,
            name: "Jane Smith",
            age: 5,
            gender: "Female",
            diagnosis: "Non-ASD",
            date: new Date().toISOString().split("T")[0],
          },
          {
            id: 3,
            name: "Michael Johnson",
            age: 8,
            gender: "Male",
            diagnosis: "ASD",
            date: new Date().toISOString().split("T")[0],
          },
          {
            id: 4,
            name: "Emily Williams",
            age: 6,
            gender: "Female",
            diagnosis: "Non-ASD",
            date: new Date().toISOString().split("T")[0],
          },
          {
            id: 5,
            name: "Robert Brown",
            age: 9,
            gender: "Male",
            diagnosis: "ASD",
            date: new Date().toISOString().split("T")[0],
          },
        ];

        setPatients(samplePatients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Diagnosis</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.id}</TableCell>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.gender}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.diagnosis === "ASD"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {patient.diagnosis}
              </span>
            </TableCell>
            <TableCell>{patient.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
