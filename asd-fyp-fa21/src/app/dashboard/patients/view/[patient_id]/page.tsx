"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Share2,
  Pencil,
  FileText,
  User,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsNav,
  TabTrigger,
  TabContent,
} from "@/components/ui/custom-tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EegDataForm from "@/components/eeg-data-form";
import { toast } from "sonner";
import Loading from "./loading";

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
  multimodal_records?: any[];
  video_records?: any[];
  last_visit?: string;
  guardian_name?: string;
  guardian_nic?: string;
}

export default function PatientInfo() {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState<Patient>();
  const [predictions, setPredictions] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-information");

  // Modal visibility states for each record type
  const [showEEGModal, setShowEEGModal] = useState(false);
  const [showFacialModal, setShowFacialModal] = useState(false);
  const [showMultimodalModal, setShowMultimodalModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [showEyeModal, setShowEyeModal] = useState(false);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchPatient() {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/patient/${patient_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              access_token: accessToken || "",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch patient: ${response.statusText}`);
        }

        const data = await response.json();
        setPatient(data.patient);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient:", error);
        setLoading(false);
      }
    }

    async function get_predictions() {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/patient/${patient_id}/predictions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              access_token: accessToken || "",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch patient: ${response.statusText}`);
        }

        const data = await response.json();

        console.log(JSON.stringify(data));

        setPredictions(() => ({
          eeg: data.eeg_predictions,
        }));
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    }

    if (patient_id) {
      fetchPatient();
      get_predictions();
    }
  }, [patient_id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files[0].type.startsWith("audio/")) {
        setUploadFile(files[0]);
        toast.success("Audio file selected successfully");
      } else {
        toast.error("Please upload an audio file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type.startsWith("audio/")) {
        setUploadFile(files[0]);
        toast.success("Audio file selected successfully");
      } else {
        toast.error("Please upload an audio file");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("audio", uploadFile);

      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/upload/speech/${patient_id}`,
        {
          method: "POST",
          headers: {
            access_token: accessToken || "",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to upload file");
      }

      if (data.success && patient) {
        const newRecord = {
          data: data.file_location,
          prediction: data.prediction,
          created_at: new Date().toISOString(),
        };

        setPatient((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            speech_data_records: [
              ...(prev.speech_data_records || []),
              newRecord,
            ],
          };
        });

        // Close modal and reset states
        setShowSpeechModal(false);
        setUploadFile(null);
        setDragActive(false);
        toast.success("Speech record uploaded successfully");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(error.message || "Failed to upload file");
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  if (!patient) {
    return <Loading />;
  }

  // Helper function to render a simple table for predictions
  const renderTable = (
    records: any[] | undefined,
    columns: {
      header: string;
      accessor: (record: any, index: number) => string;
    }[]
  ) => {
    return (
      <table className="min-w-full mt-4">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2 text-left text-sm">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records && records.length > 0 ? (
            records.map((record, index) => (
              <tr key={index} className="border-t border-gray-700">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-4 py-2 text-sm">
                    {col.accessor(record, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-2 text-center text-gray-400"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link
            href="/dashboard"
            className="hover:text-white flex items-center"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={14} />
          <Link href="/dashboard/patients/list" className="hover:text-white">
            Patients
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">Patient Info</span>
        </div>

        <h1 className="text-2xl font-bold mb-8">Patient Info</h1>

        <Tabs defaultTab="patient-information" onChange={setActiveTab}>
          <TabsNav>
            <TabTrigger id="patient-information">
              Patient Information
            </TabTrigger>
            <TabTrigger id="eeg-record">EEG Record</TabTrigger>
            <TabTrigger id="facial-information-record">
              Facial Information Record
            </TabTrigger>
            <TabTrigger id="multimodal-record">Multimodal Record</TabTrigger>
            <TabTrigger id="speech-data-records">
              Speech Data Records
            </TabTrigger>
            <TabTrigger id="video-record">Video Record</TabTrigger>
          </TabsNav>

          <TabContent id="patient-information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Patient Profile */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-full h-48 bg-[#0f0f0f] rounded-lg mb-4 flex items-center justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarFallback className="bg-blue-900 text-2xl">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Last Doctor Visit {patient.last_visit}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 text-gray-300">
                    <FileText size={18} className="text-gray-400" />
                    <span className="text-gray-400">Contact Information</span>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                      <Mail size={18} className="text-gray-400" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                      <Phone size={18} className="text-gray-400" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 border-b border-gray-800 pb-3">
                      <MapPin size={18} className="text-gray-400" />
                      <span>{patient.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-white text-black hover:bg-gray-200">
                    <Pencil size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-700"
                  >
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
                      <span className="text-gray-400">Patient ID</span>
                      <span className="text-right">{patient._id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Full Name</span>
                      <span className="text-right">{patient.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Date of Birth</span>
                      <span className="text-right">{patient.dob}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Gender</span>
                      <span className="text-right">
                        {patient.gender === "male" ? "Male" : "Female"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Place of Birth</span>
                      <span className="text-right">
                        {patient.born_city}, {patient.born_country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guardian Information Card */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-4 text-gray-300">
                    <User size={18} className="text-gray-400" />
                    <span className="text-gray-300 font-medium">
                      Guardian Information
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Guardian Name</span>
                      <span className="text-right">{patient.father_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-3">
                      <span className="text-gray-400">Guardian NIC</span>
                      <span className="text-right">{patient.father_cnic}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabContent>

          {/* EEG Record Tab */}
          <TabContent id="eeg-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">EEG Records</h3>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowEEGModal(true)}
              >
                Add EEG Record
              </Button>
              {renderTable(predictions?.eeg, [
                { header: "Record #", accessor: (_, i) => String(i + 1) },
                { header: "Group", accessor: (rec) => rec.group ?? "-" },
                {
                  header: "Prediction Probablility",
                  accessor: (rec) =>
                    Number(rec.prediction_result_in_probability).toFixed(5) ||
                    "-",
                },
                {
                  header: "Created At",
                  accessor: (rec) =>
                    new Date(rec.created_at).toDateString() || "-",
                },
                {
                  header: "Updated At",
                  accessor: (rec) =>
                    new Date(rec.updated_at).toDateString() || "-",
                },
              ])}
            </div>
          </TabContent>

          {/* Facial Information Record Tab */}
          <TabContent id="facial-information-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">
                Facial Information Records
              </h3>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowFacialModal(true)}
              >
                Add Facial Record
              </Button>
              {renderTable(patient.facial_data_records, [
                { header: "Record #", accessor: (_, i) => String(i + 1) },
                { header: "Info", accessor: (rec) => rec.info || "-" },
              ])}
            </div>
          </TabContent>
          {/* Multimodal Record Tab */}
          <TabContent id="multimodal-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">Multimodal Records</h3>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowMultimodalModal(true)}
              >
                Add Multimodal Record
              </Button>
              {renderTable(patient.multimodal_records, [
                { header: "Record #", accessor: (_, i) => String(i + 1) },
                { header: "Details", accessor: (rec) => rec.details || "-" },
              ])}
            </div>
          </TabContent>

          {/* Speech Data Records Tab */}
          <TabContent id="speech-data-records">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">Speech Data Records</h3>
              <Button
                onClick={() => setShowSpeechModal(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Speech Record
              </Button>
              {renderTable(patient.speech_data_records, [
                { header: "Record #", accessor: (_, i) => String(i + 1) },
                {
                  header: "Transcript",
                  accessor: (rec) => rec.transcript || "-",
                },
              ])}
            </div>
          </TabContent>

          {/* Video Record Tab (New) */}
          <TabContent id="video-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">Video Records</h3>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowVideoModal(true)}
              >
                Add Video Record
              </Button>
              {renderTable(patient.video_records, [
                { header: "Record #", accessor: (_, i) => String(i + 1) },
                { header: "Video URL", accessor: (rec) => rec.url || "-" },
              ])}
            </div>
          </TabContent>
        </Tabs>
      </div>

      {/* EEG Modal */}
      {showEEGModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Patient EEG Data
                </h2>
                <button
                  onClick={() => setShowEEGModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <EegDataForm
                patient={patient}
                updateData={(data) => {
                  setPredictions(() => ({
                    ...predictions,
                    eeg: [...predictions.eeg, data],
                  }));
                }}
                closeModal={() => setShowEEGModal(() => false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Facial Modal */}
      {showFacialModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Facial Information Record
                </h2>
                <button
                  onClick={() => setShowFacialModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">Facial record form goes here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal Modal */}
      {showMultimodalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Multimodal Record
                </h2>
                <button
                  onClick={() => setShowMultimodalModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">
                Multimodal record form goes here...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Video Record
                </h2>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">Video record form goes here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Speech Upload Modal */}
      {showSpeechModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Speech Record</h2>
                <button
                  onClick={() => {
                    setShowSpeechModal(false);
                    setUploadFile(null);
                    setUploadError(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                  {uploadError}
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-lg font-semibold text-gray-400">
                  {uploadFile ? uploadFile.name : "Drag and Drop audio file"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click to browse or drag and drop
                </p>
              </div>

              {uploadFile && (
                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 relative"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Upload File
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">Delete Record</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">
                Delete confirmation dialog goes here...
              </p>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">Edit Record</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">Edit form goes here...</p>
            </div>
          </div>
        </div>
      )}

      {showBehaviorModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Behavior Record
                </h2>
                <button
                  onClick={() => setShowBehaviorModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">Behavior record form goes here...</p>
            </div>
          </div>
        </div>
      )}

      {showEyeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Add Eye Contact Record
                </h2>
                <button
                  onClick={() => setShowEyeModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400">
                Eye contact record form goes here...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
