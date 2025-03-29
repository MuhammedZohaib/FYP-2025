"use client";

import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Stethoscope,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function DoctorProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8000/api/doctor/profile");
        if (!res.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  // Assuming the API returns a structure similar to:
  // {
  //   doctor: { name: "Dr. Zohaib Ahmad", email: "...", ... },
  //   patients: [
  //     { id: "67c62431953c", name: "Rafaela Koss" },
  //     { id: "89d35621734a", name: "Ahmed Hassan" },
  //     // more patients...
  //   ],
  //   // other profile fields...
  // }
  const { doctor, patients } = profileData;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 p-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </Link>
        <span className="text-gray-400">&gt;</span>
        <Link href="/doctors" className="text-gray-400 hover:text-white">
          Doctors
        </Link>
        <span className="text-gray-400">&gt;</span>
        <span>Doctor Info</span>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor Info</h1>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="bg-zinc-900 border-b border-zinc-800">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Personal Information
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Patients
            </TabsTrigger>
            <TabsTrigger
              value="qualifications"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Qualifications
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Medical Records
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Doctor Profile Summary */}
            <div className="col-span-1">
              <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-blue-700 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold">
                    {doctor?.initials || "DZ"}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{doctor?.name}</h2>
                <p className="text-gray-400 mb-4">{doctor?.specialization}</p>

                <div className="w-full space-y-4 mt-4">
                  <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
                    <Mail className="text-gray-400" size={18} />
                    <span>{doctor?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <span>{doctor?.phone || "555-765-4321"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-400" size={18} />
                    <span>{doctor?.address || "123 Medical Center Dr."}</span>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      Edit Profile
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                          fill="currentColor"
                        />
                        <path
                          d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                          fill="currentColor"
                        />
                        <path
                          d="M8.59 13.51L15.42 17.49"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.41 6.51L8.59 10.49"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Tab Content */}
            <div className="col-span-1 md:col-span-2">
              <TabsContent value="personal" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center mb-4">
                    <User className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">General Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Doctor ID</span>
                      <span className="font-medium">
                        {doctor?.id || "DOC78921345631"}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Full Name</span>
                      <span className="font-medium">{doctor?.name}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Specialization</span>
                      <span className="font-medium">
                        {doctor?.specialization || "Neurology"}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Years of Experience</span>
                      <span className="font-medium">
                        {doctor?.experience || "12"}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">License Number</span>
                      <span className="font-medium">
                        {doctor?.license || "MED-6754-NY"}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center mb-4">
                    <Building className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">
                      Department Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Department</span>
                      <span className="font-medium">
                        {doctor?.department || "Neurology"}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Position</span>
                      <span className="font-medium">
                        {doctor?.position || "Head of Department"}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Office Location</span>
                      <span className="font-medium">
                        {doctor?.office || "East Wing, Room 302"}
                      </span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">Weekly Schedule</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">Monday</span>
                      </div>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">Tuesday</span>
                      </div>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">Wednesday</span>
                      </div>
                      <span>10:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">Thursday</span>
                      </div>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">Friday</span>
                      </div>
                      <span>9:00 AM - 3:00 PM</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="mr-2" size={20} />
                      <h3 className="text-lg font-medium">Current Patients</h3>
                    </div>
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
                      {patients?.length || 0} Total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {patients && patients.length > 0 ? (
                      patients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex justify-between items-center p-3 bg-zinc-800 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-400">
                              ID: {patient.id.slice(0, 12)}...
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No patients found.</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" size="sm">
                      View All Patients
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="qualifications" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center mb-4">
                    <Award className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">
                      Education & Certifications
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium">Medical School</h4>
                      <p className="text-gray-400">
                        Johns Hopkins School of Medicine
                      </p>
                      <p className="text-sm text-gray-500">
                        MD - Doctor of Medicine, 2005-2009
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Residency</h4>
                      <p className="text-gray-400">Mayo Clinic</p>
                      <p className="text-sm text-gray-500">
                        Neurology, 2009-2013
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Fellowship</h4>
                      <p className="text-gray-400">Cleveland Clinic</p>
                      <p className="text-sm text-gray-500">
                        Neuroimmunology, 2013-2015
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium">Certifications</h4>
                      <ul className="list-disc list-inside text-gray-400 space-y-2 mt-2">
                        <li>American Board of Psychiatry and Neurology</li>
                        <li>Neuroimmunology Specialist Certification</li>
                        <li>Advanced Life Support Certification</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="records" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center mb-4">
                    <Stethoscope className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">
                      Medical Records Activity
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div>
                        <p className="font-medium">
                          Updated Patient EEG Results
                        </p>
                        <p className="text-sm text-gray-400">
                          Patient: Rafaela Koss
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Today, 10:23 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div>
                        <p className="font-medium">Added Treatment Notes</p>
                        <p className="text-sm text-gray-400">
                          Patient: Ahmed Hassan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Yesterday, 3:45 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div>
                        <p className="font-medium">Reviewed MRI Results</p>
                        <p className="text-sm text-gray-400">
                          Patient: Maria Rodriguez
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Feb 15, 2023, 11:30 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <div>
                        <p className="font-medium">Created Prescription</p>
                        <p className="text-sm text-gray-400">
                          Patient: John Smith
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Feb 14, 2023, 2:15 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
