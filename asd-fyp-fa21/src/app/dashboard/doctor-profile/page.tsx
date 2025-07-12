"use client";

import {
  Mail,
  MapPin,
  Phone,
  Share2,
  Pencil,
  FileText,
  Calendar,
  Award,
  Stethoscope,
  Users,
  Home,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Loading from "./loading";
import { API_BASE_URL } from "@/lib/config";

// Doctor type
interface DoctorData {
  _id: string;
  name: string;
  email: string;
  location: string;
  phone: string;
  specialization: string;
  picture: string;
  patients: string[];
  consultations: any[];
  joining: string;
  experience: string;
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctor profile");
        }

        const data = await response.json();
        setDoctor(data);
      } catch (err) {
        setError("Error fetching doctor profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !doctor) {
    return (
      <div className="flex min-h-screen bg-[#0f0f0f] text-white items-center justify-center">
        <p>{error || "Failed to load doctor profile"}</p>
      </div>
    );
  }

  const joinDate = new Date(doctor.joining);
  const joinMonth = joinDate.toLocaleString("default", { month: "long" });
  const joinDay = joinDate.getDate();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link
            href="/dashboard"
            className="hover:text-white flex items-center"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">Doctor Info</span>
        </div>
        <h1 className="text-2xl font-bold mb-8">Doctor Info</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Doctor Profile */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <div className="flex flex-col items-center mb-6">
              <div className="w-full h-48 bg-[#0f0f0f] rounded-lg mb-4 flex items-center justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="bg-blue-900 text-2xl">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold">{doctor.name}</h2>
              <p className="text-sm text-gray-400 mt-1">Last Login: Today</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 text-gray-300">
                <FileText size={18} className="text-gray-400" />
                <span className="text-gray-400">Contact Information</span>
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                  <Mail size={18} className="text-gray-400" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                  <Phone size={18} className="text-gray-400" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                  <MapPin size={18} className="text-gray-400" />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/dashboard/doctor-profile/edit" className="flex-1">
                <Button className="w-full flex-1 bg-white text-black hover:bg-gray-200">
                  <Pencil size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="border-gray-700">
                <Share2 size={16} />
              </Button>
            </div>
          </div>

          {/* Right Column - Information Cards */}
          <div className="space-y-6">
            {/* General Information Card */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4 text-gray-300">
                <FileText size={18} className="text-gray-400" />
                <span className="text-gray-300 font-medium">
                  General Information
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Doctor ID</span>
                  <span className="text-right">{doctor._id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Full Name</span>
                  <span className="text-right">{doctor.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Specialization</span>
                  <span className="text-right">{doctor.specialization}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Experience</span>
                  <span className="text-right">{doctor.experience}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Joined</span>
                  <span className="text-right">
                    {formatDate(doctor.joining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4 text-gray-300">
                <Users size={18} className="text-gray-400" />
                <span className="text-gray-300 font-medium">Statistics</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center">
                  <Users className="h-5 w-5 mx-auto mb-2" />
                  <h4 className="text-lg font-medium">
                    {doctor.patients.length}
                  </h4>
                  <p className="text-xs text-gray-400">Patients</p>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2" />
                  <h4 className="text-lg font-medium">{doctor.experience}</h4>
                  <p className="text-xs text-gray-400">Experience</p>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center">
                  <Award className="h-5 w-5 mx-auto mb-2" />
                  <h4 className="text-lg font-medium">
                    {doctor.consultations.length}
                  </h4>
                  <p className="text-xs text-gray-400">Consultations</p>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center">
                  <Stethoscope className="h-5 w-5 mx-auto mb-2" />
                  <h4 className="text-lg font-medium">
                    {joinMonth} {joinDay}
                  </h4>
                  <p className="text-xs text-gray-400">Joined</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
