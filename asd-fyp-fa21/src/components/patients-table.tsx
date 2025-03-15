"use client";
import { Eye, Table } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

const patients = [
  {
    id: "P0001",
    date: "2024-12-16",
    name: "Alex Johnson",
    guardian: "Sarah Johnson",
    gender: "Male",
    status: "Diagnosed",
    dob: "2018-04-10",
  },
  {
    id: "P0002",
    date: "2024-12-16",
    name: "Emma Smith",
    guardian: "John Smith",
    gender: "Female",
    status: "Not Diagnosed",
    dob: "2017-07-22",
  },
  {
    id: "P0003",
    date: "2024-12-16",
    name: "Liam Brown",
    guardian: "Lisa Brown",
    gender: "Male",
    status: "Diagnosed",
    dob: "2019-01-15",
  },
  {
    id: "P0004",
    date: "2024-12-16",
    name: "Olivia Davis",
    guardian: "Robert Davis",
    gender: "Female",
    status: "Not Diagnosed",
    dob: "2016-09-05",
  },
  {
    id: "P0005",
    date: "2024-12-16",
    name: "Noah Wilson",
    guardian: "Maria Wilson",
    gender: "Male",
    status: "Diagnosed",
    dob: "2020-02-28",
  },
  {
    id: "P0006",
    date: "2024-12-16",
    name: "Ava Martinez",
    guardian: "Carlos Martinez",
    gender: "Female",
    status: "Diagnosed",
    dob: "2018-11-11",
  },
];

export function PatientsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Guardian</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>ASD Status</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.id}</TableCell>
              <TableCell>{patient.date}</TableCell>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.guardian}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    patient.status === "Diagnosed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {patient.status}
                </div>
              </TableCell>
              <TableCell>{patient.dob}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View patient</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
