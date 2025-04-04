"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Home, ChevronRight } from "lucide-react";
import Loading from "./loading";
import Link from "next/link";

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

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DoctorData>>({
    name: "",
    email: "",
    location: "",
    phone: "",
    specialization: "",
    experience: "",
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/doctor/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctor profile");
        }

        const data = await response.json();
        setFormData({
          name: data.name,
          email: data.email,
          location: data.location,
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
        });
      } catch (err) {
        setError("Error fetching doctor profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/doctor/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();

      if (data.detail === "Doctor profile updated successfully") {
        router.push("/dashboard/doctor-profile");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-white flex items-center">
            <Home size={16} />
          </Link>
          <ChevronRight size={14} />
          <Link href="/dashboard/doctor-profile" className="hover:text-white">
            Doctor Info
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">Edit Profile</span>
        </div>

        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Doctor Profile</h1>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-gray-800"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2 bg-transparent border-gray-700"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-white text-black hover:bg-gray-200"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
