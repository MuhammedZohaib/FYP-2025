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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs } from "@/components/ui/custom-tabs";
import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@radix-ui/react-select";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  location: string;
  phone: string;
  specialization: string;
  picture: string;
  experience: string;
  patients: any[];
  consultations: any[];
  joining: string;
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        // Get access token from localStorage or wherever you store it
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/doctor/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setDoctor(data);
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load doctor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <Alert variant="destructive" className="bg-red-900 border-red-800">
          <AlertDescription>
            {error}. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <Alert className="bg-zinc-900 border-zinc-800">
          <AlertDescription>
            No doctor profile data found. Please check your account or contact
            support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

        <Tabs className="w-full" defaultTab={"personal"}>
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
                  {doctor.picture && doctor.picture !== "nothing there" ? (
                    <img
                      src={doctor.picture || "/placeholder.svg"}
                      alt={doctor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">
                      {getInitials(doctor.name)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">Dr. {doctor.name}</h2>
                <p className="text-gray-400 mb-4">{doctor.specialization}</p>

                <div className="w-full space-y-4 mt-4">
                  <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
                    <Mail className="text-gray-400" size={18} />
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-400" size={18} />
                    <span>{doctor.location}</span>
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
                      <span className="font-medium">{doctor._id}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Full Name</span>
                      <span className="font-medium">Dr. {doctor.name}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Specialization</span>
                      <span className="font-medium">
                        {doctor.specialization}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Years of Experience</span>
                      <span className="font-medium">{doctor.experience}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Joined</span>
                      <span className="font-medium">
                        {formatDate(doctor.joining)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center mb-4">
                    <Building className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">Contact Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium">{doctor.email}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium">{doctor.phone}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between py-2">
                      <span className="text-gray-400">Location</span>
                      <span className="font-medium">{doctor.location}</span>
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
                      {doctor.patients.length} Total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {doctor.patients.length > 0 ? (
                      doctor.patients.slice(0, 4).map((patient, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-zinc-800 rounded-md"
                        >
                          <div>
                            <p className="font-medium">
                              {patient.name || "Patient Name"}
                            </p>
                            <p className="text-sm text-gray-400">
                              ID: {patient._id || "Unknown ID"}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-zinc-800 rounded-md text-center">
                        <p>No patients assigned yet</p>
                      </div>
                    )}
                  </div>
                  {doctor.patients.length > 4 && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm">
                        View All Patients
                      </Button>
                    </div>
                  )}
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
                      <h4 className="font-medium">Experience</h4>
                      <p className="text-gray-400">{doctor.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Specialization</h4>
                      <p className="text-gray-400">{doctor.specialization}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium">Member Since</h4>
                      <p className="text-gray-400">
                        {formatDate(doctor.joining)}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="records" className="mt-0">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center mb-4">
                    <Stethoscope className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">Consultations</h3>
                  </div>
                  <div className="space-y-4">
                    {doctor.consultations.length > 0 ? (
                      doctor.consultations
                        .slice(0, 4)
                        .map((consultation, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-zinc-800 rounded-md"
                          >
                            <div>
                              <p className="font-medium">
                                {consultation.title || "Consultation"}
                              </p>
                              <p className="text-sm text-gray-400">
                                Patient:{" "}
                                {consultation.patientName || "Unknown Patient"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">
                                {consultation.date
                                  ? formatDate(consultation.date)
                                  : "No date"}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-3 bg-zinc-800 rounded-md text-center">
                        <p>No consultations recorded yet</p>
                      </div>
                    )}
                  </div>
                  {doctor.consultations.length > 4 && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm">
                        View All Consultations
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
