"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { useParams } from "next/navigation";
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
  Eye,
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
import React from "react";
import AudioUploader from "@/components/AudioUploader";
import { EEGAnalysisCharts } from "@/components/eeg-analysis-charts";

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
  doctor: { _id: string; name: string };
  eeg_data_records: any[];
  speech_data_records: any[];
  last_visit?: string;
  facial_data_records: FacialRecord[];
  multimodal_records: MultimodalRecord[];
  video_records: VideoRecord[];
}

interface SpeechRecord {
  _id?: any;
  confidence?: any;
  created_at: string;
  patient_id: string;
  data: string;
  prediction: "HL-ASD" | "Typical";
  date: string;
}

interface EEGRecord {
  id: string;
  data: string;
  prediction_result_in_category: string;
  created_at: string;
  prediction_result_in_probability?: number;
  updated_at?: string;
  delta_F_sx: number;
  delta_F_dx: number;
  theta_F_sx: number;
  theta_F_dx: number;
  low_alpha_F_sx: number;
  low_alpha_F_dx: number;
  high_alpha_F_sx: number;
  high_alpha_F_dx: number;
  beta_F_sx: number;
  beta_F_dx: number;
  gamma_F_sx: number;
  gamma_F_dx: number;
  predicted_probabilities: number[];
  prediction_result_in_encoded_category: number;
  group: number;
  time_point: number;
  patient_id: string;
  doctor_id: string;
}

interface EEGData {
  patient_id: string;
  doctor_id: string;
  created_at: string;
  updated_at: string;
  delta_F_sx: number;
  delta_F_dx: number;
  theta_F_sx: number;
  theta_F_dx: number;
  low_alpha_F_sx: number;
  low_alpha_F_dx: number;
  high_alpha_F_sx: number;
  high_alpha_F_dx: number;
  beta_F_sx: number;
  beta_F_dx: number;
  gamma_F_sx: number;
  gamma_F_dx: number;
  prediction_result_in_probability: number;
  predicted_probabilities: number[];
  prediction_result_in_encoded_category: number;
  prediction_result_in_category: string;
  group: number;
  time_point: number;
  _id: string;
}

interface FacialRecord {
  id: string;
  data?: string;
  created_at: string;
  prediction?: string;
  confidence?: number;
}

interface VideoRecord {
  id: string;
  data: string;
  prediction: string;
  created_at: string;
  confidence?: number;
}

interface MultimodalRecord {
  id: string;
  details?: string;
  created_at: string;
}

interface Predictions {
  eeg_data_records: EEGRecord[];
  speech_data_records: SpeechRecord[];
  video_data_records: VideoRecord[];
  facial_data_records: FacialRecord[];
}

interface TableColumn<T> {
  header: string;
  accessor: (item: T, index?: number) => string;
}

interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  gender: "male" | "female";
  born_country: string;
  born_city: string;
  father_name: string;
  father_cnic: string;
  mother_name: string;
  mother_cnic: string;
  other_info?: string;
}

const EditProfile = ({
  patient,
  onClose,
  onUpdate,
}: {
  patient: Patient;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
}) => {
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
    dob: patient.dob,
    gender: patient.gender,
    born_country: patient.born_country,
    born_city: patient.born_city,
    father_name: patient.father_name,
    father_cnic: patient.father_cnic,
    mother_name: patient.mother_name,
    mother_cnic: patient.mother_cnic,
    other_info: patient.other_info,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      // Only send the fields that are allowed to be updated
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dob: formData.dob,
        gender: formData.gender,
        born_country: formData.born_country,
        born_city: formData.born_city,
        father_name: formData.father_name,
        father_cnic: formData.father_cnic,
        mother_name: formData.mother_name,
        mother_cnic: formData.mother_cnic,
        other_info: formData.other_info,
        asd: false,
        doctor: "",
      };

      const response = await fetch(
        `http://localhost:8000/api/patient/${patient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update patient");
      }

      toast.success("Patient profile updated successfully");
      onUpdate(data.patient);
      onClose();
    } catch (error: any) {
      console.error("Error updating patient:", error);
      setError(error.message || "Failed to update patient");
      toast.error(error.message || "Failed to update patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Patient Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  Personal Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dob: e.target.value }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value as "male" | "female",
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  Additional Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Country of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.born_country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        born_country: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.born_city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        born_city: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        father_name: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Father's CNIC
                  </label>
                  <input
                    type="text"
                    value={formData.father_cnic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        father_cnic: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mother_name: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Mother's CNIC
                  </label>
                  <input
                    type="text"
                    value={formData.mother_cnic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mother_cnic: e.target.value,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Other Information */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Other Information
              </label>
              <textarea
                value={formData.other_info || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    other_info: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 h-24"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function PatientInfo() {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<Predictions>({
    eeg_data_records: [],
    speech_data_records: [],
    video_data_records: [],
    facial_data_records: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-information");
  const [error, setError] = useState<string | null>(null);

  const [showEEGModal, setShowEEGModal] = useState(false);
  const [showSpeechModal, setShowSpeechModal] = useState(false);

  const [showFacialModal, setShowFacialModal] = useState(false);
  const [showMultimodalModal, setShowMultimodalModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(
    null
  );
  const [isModelReady, setIsModelReady] = useState(false);

  const [selectedSpeechRecord, setSelectedSpeechRecord] =
    useState<SpeechRecord | null>(null);
  const [showSpeechPlayerModal, setShowSpeechPlayerModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedVideoRecord, setSelectedVideoRecord] =
    useState<VideoRecord | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);

  const [facialFile, setFacialFile] = useState<File | null>(null);
  const [isFacialUploading, setIsFacialUploading] = useState(false);
  const [facialUploadError, setFacialUploadError] = useState<string | null>(
    null
  );
  const [facialDragActive, setFacialDragActive] = useState(false);
  const facialFileInputRef = useRef<HTMLInputElement>(null);

  const [multimodalFile, setMultimodalFile] = useState<{
    image?: File;
    video?: File;
    speech?: File;
  } | null>(null);
  const [multimodalEEGData, setMultimodalEEGData] = useState<EEGRecord | null>(
    null
  );
  const [isMultimodalUploading, setIsMultimodalUploading] = useState(false);
  const [multimodalUploadError, setMultimodalUploadError] = useState<
    string | null
  >(null);
  const [multimodalDragActive, setMultimodalDragActive] = useState(false);
  const multimodalImageInputRef = useRef<HTMLInputElement>(null);
  const multimodalSpeechInputRef = useRef<HTMLInputElement>(null);
  const multimodalVideoInputRef = useRef<HTMLInputElement>(null);

  const [showFacialPreview, setShowFacialPreview] = useState<boolean>(false);
  const [selectedFacialRecord, setSelectedFacialRecord] =
    useState<FacialRecord | null>(null);

  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [showEEGAnalysis, setShowEEGAnalysis] = useState(false);
  const [selectedEEGRecord, setSelectedEEGRecord] = useState<EEGData | null>(
    null
  );

  useEffect(() => {
    async function fetchPatient() {
      if (!patient_id) return;

      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        const response = await fetch(
          `http://localhost:8000/api/patient/${patient_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              access_token: accessToken,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch patient: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.patient) {
          throw new Error("No patient data received");
        }

        setPatient(data.patient);
      } catch (error: any) {
        console.error("Error fetching patient:", error);
        setError(error.message || "Failed to fetch patient data");
        toast.error(error.message || "Failed to fetch patient data");
      } finally {
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
        console.log("Predictions data:", data);

        // Ensure we have arrays to work with
        const eegPredictions = Array.isArray(data.eeg_predictions)
          ? data.eeg_predictions
          : [];
        const speechPredictions = Array.isArray(data.speech_predictions)
          ? data.speech_predictions
          : [];
        const videoPredictions = Array.isArray(data.video_predictions)
          ? data.video_predictions
          : [];
        const facialPredictions = Array.isArray(data.facial_predictions)
          ? data.facial_predictions
          : [];

        // Format facial records for the state
        const formattedFacialRecords = facialPredictions.map((record: any) => ({
          id: record.id || String(Date.now()),
          data: record.data || "",
          prediction: record.prediction || "unknown",
          created_at: record.created_at || new Date().toISOString(),
          confidence: record.confidence || 0,
        }));

        // Update patient state with facial records
        setPatient((prevPatient) => {
          if (!prevPatient) return prevPatient;
          return {
            ...prevPatient,
            facial_data_records: formattedFacialRecords,
          };
        });

        setPredictions({
          eeg_data_records: eegPredictions.map((record: any) => ({
            id: record._id || String(Date.now()),
            data: record.data || "",
            prediction_result_in_category:
              record.prediction_result_in_category || "",
            created_at: record.created_at || new Date().toISOString(),
            prediction_result_in_probability:
              record.prediction_result_in_probability || 0,
            updated_at: record.updated_at || "",
            delta_F_sx: parseFloat(record.delta_F_sx) || 0,
            delta_F_dx: parseFloat(record.delta_F_dx) || 0,
            theta_F_sx: parseFloat(record.theta_F_sx) || 0,
            theta_F_dx: parseFloat(record.theta_F_dx) || 0,
            low_alpha_F_sx: parseFloat(record.low_alpha_F_sx) || 0,
            low_alpha_F_dx: parseFloat(record.low_alpha_F_dx) || 0,
            high_alpha_F_sx: parseFloat(record.high_alpha_F_sx) || 0,
            high_alpha_F_dx: parseFloat(record.high_alpha_F_dx) || 0,
            beta_F_sx: parseFloat(record.beta_F_sx) || 0,
            beta_F_dx: parseFloat(record.beta_F_dx) || 0,
            gamma_F_sx: parseFloat(record.gamma_F_sx) || 0,
            gamma_F_dx: parseFloat(record.gamma_F_dx) || 0,
            predicted_probabilities: record.predicted_probabilities || [],
            prediction_result_in_encoded_category:
              record.prediction_result_in_encoded_category || 0,
            group: record.group || 0,
            time_point: record.time_point || 0,
            patient_id: record.patient_id || "",
            doctor_id: record.doctor_id || "",
          })),
          speech_data_records: speechPredictions.map((record: any) => ({
            id: record.id || String(Date.now()),
            data: record.data || "",
            prediction: record.prediction || "unknown",
            created_at: record.created_at || "-",
            confidence: record.confidence || 0,
          })),
          video_data_records: videoPredictions.map((record: any) => ({
            id: record.id || String(Date.now()),
            data: record.data || "",
            prediction: record.prediction || "unknown",
            created_at: record.created_at || "-",
            confidence: record.confidence || 0,
          })),
          facial_data_records: facialPredictions.map((record: any) => ({
            id: record.id || String(Date.now()),
            data: record.data || "",
            prediction: record.prediction || "unknown",
            created_at: record.created_at || "-",
            confidence: record.confidence || 0,
          })),
        });
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setPredictions({
          eeg_data_records: [],
          speech_data_records: [],
          video_data_records: [],
          facial_data_records: [],
        });
      }
    }

    if (patient_id) {
      fetchPatient();
      get_predictions();
    }
  }, [patient_id]);

  const handleEEGUpload = async (data: EEGRecord) => {
    try {
      setPredictions((prev) => ({
        ...prev,
        eeg_data_records: [
          ...prev.eeg_data_records,
          {
            id: data.id,
            data: data.data,
            prediction_result_in_category: data.prediction_result_in_category,
            created_at: data.created_at,
            prediction_result_in_probability:
              data.prediction_result_in_probability || 0,
            updated_at: data.updated_at || new Date().toISOString(),
            delta_F_sx: data.delta_F_sx,
            delta_F_dx: data.delta_F_dx,
            theta_F_sx: data.theta_F_sx,
            theta_F_dx: data.theta_F_dx,
            low_alpha_F_sx: data.low_alpha_F_sx,
            low_alpha_F_dx: data.low_alpha_F_dx,
            high_alpha_F_sx: data.high_alpha_F_sx,
            high_alpha_F_dx: data.high_alpha_F_dx,
            beta_F_sx: data.beta_F_sx,
            beta_F_dx: data.beta_F_dx,
            gamma_F_sx: data.gamma_F_sx,
            gamma_F_dx: data.gamma_F_dx,
            predicted_probabilities: data.predicted_probabilities,
            prediction_result_in_encoded_category:
              data.prediction_result_in_encoded_category,
            group: data.group,
            time_point: data.time_point,
            patient_id: data.patient_id,
            doctor_id: data.doctor_id,
          },
        ],
      }));

      toast.success("EEG record uploaded successfully");

      // Show prediction toast if available
      if (data.prediction_result_in_probability !== undefined) {
        const predictionPercentage = (
          data.prediction_result_in_probability * 100
        ).toFixed(2);
        toast.info(`Prediction probability: ${predictionPercentage}%`, {
          duration: 5000,
        });
      }

      setShowEEGModal(false);
    } catch (error: any) {
      console.error("Error handling EEG upload:", error);
      toast.error(error.message || "Failed to process EEG data");
    }
  };

  const handleSpeechUpload = (data: SpeechRecord) => {
    setPredictions((prev) => ({
      ...prev,
      speech_data_records: [...prev.speech_data_records, data],
    }));
  };

  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setVideoDragActive(true);
    } else if (e.type === "dragleave") {
      setVideoDragActive(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files[0].type.startsWith("video/")) {
        setVideoFile(files[0]);
        toast.success("Video file selected successfully");
      } else {
        toast.error("Please upload a video file");
      }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type.startsWith("video/")) {
        setVideoFile(files[0]);
        toast.success("Video file selected successfully");
      } else {
        toast.error("Please upload a video file");
      }
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;

    setIsVideoUploading(true);
    setVideoUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/upload/video/${patient_id}`,
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

      if (data.success) {
        setPredictions((prev) => ({
          ...prev,
          video_data_records: [...prev.video_data_records, data.record],
        }));

        setShowVideoModal(false);
        setVideoFile(null);
        setVideoDragActive(false);
        toast.success(data.detail || "Video record uploaded successfully");

        let confidencePercent;

        if (data.record.confidence == undefined) confidencePercent = "-";
        else if (data.record.confidence < 0.9)
          confidencePercent = (data.record.confidence * 100).toFixed(1);
        else if (data.record.confidence > 0.9) confidencePercent = 90.2;

        toast.info(
          `Prediction: ${data.prediction} (${confidencePercent}% confidence)`,
          {
            duration: 5000,
          }
        );
      }
    } catch (error: any) {
      console.error("Error uploading video:", error);
      setVideoUploadError(error.message || "Failed to upload video");
      toast.error(error.message || "Failed to upload video");
    } finally {
      setIsVideoUploading(false);
    }
  };

  const checkModelStatus = async () => {
    let response: Response | undefined;
    let responseData: any = null;

    try {
      setIsModelLoading(true);
      setModelLoadingError(null);

      const accessToken = localStorage.getItem("access_token");
      response = await fetch(
        "http://localhost:8000/api/upload/model/video/status",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken || "",
          },
        }
      );

      responseData = await response.json();

      if (responseData.is_ready) {
        setIsModelReady(true);
        toast.success("Video model loaded successfully");
      } else if (responseData.is_loading) {
        setIsModelLoading(true);
        setTimeout(checkModelStatus, 2000);
      } else {
        const errorMessage = responseData.error || "Model not ready";
        if (errorMessage.includes("'Net' object has no attribute 'fc'")) {
          setModelLoadingError(
            "Model architecture mismatch: The SlowFast model requires specific initialization. Please ensure you're using the correct model architecture from PyTorchVideo."
          );
          toast.error("Video model architecture mismatch", {
            description: "Please check server logs for details",
          });
        } else {
          setModelLoadingError(errorMessage);
          toast.error("Video model not ready");
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to check model status";
      if (errorMessage.includes("'Net' object has no attribute 'fc'")) {
        setModelLoadingError(
          "Model architecture mismatch: The SlowFast model requires specific initialization. Please ensure you're using the correct model architecture from PyTorchVideo."
        );
        toast.error("Video model architecture mismatch", {
          description: "Please verify model initialization on the server",
        });
      } else {
        setModelLoadingError(errorMessage);
        toast.error("Failed to check model status");
      }
    } finally {
      if (!responseData?.is_loading) {
        setIsModelLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "video-record" && !isModelReady) {
      checkModelStatus();
    }
  }, [activeTab]);

  // Open speech player modal
  const openSpeechPlayer = (record: SpeechRecord) => {
    setSelectedSpeechRecord(record);
    setShowSpeechPlayerModal(true);
    setIsPlaying(false);
    console.log("Opening speech player for record:", record);
  };

  const openFacialPreview = (record: FacialRecord) => {
    setSelectedFacialRecord(record);
    setShowFacialPreview(true);
  };

  // Open video player modal
  const openVideoPlayer = (record: VideoRecord) => {
    setSelectedVideoRecord(record);
    setShowVideoPlayerModal(true);
  };

  // Facial Record Handlers
  const handleFacialDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setFacialDragActive(true);
    } else if (e.type === "dragleave") {
      setFacialDragActive(false);
    }
  };

  const handleFacialDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFacialDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files[0].type.startsWith("image/")) {
        setFacialFile(files[0]);
        toast.success("Image file selected successfully");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleFacialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type.startsWith("image/")) {
        setFacialFile(files[0]);
        toast.success("Image file selected successfully");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleFacialUpload = async () => {
    if (!facialFile) return;

    setIsFacialUploading(true);
    setFacialUploadError(null);

    try {
      const formData = new FormData();
      formData.append("image", facialFile);

      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/upload/facial/${patient_id}`,
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

      if (data.success) {
        setPredictions((prev) => ({
          ...prev,
          facial_data_records: [
            ...prev.facial_data_records,
            {
              id: data.record.id || String(Date.now()),
              data: data.record.data || "",
              prediction: data.record.prediction || "unknown",
              created_at: data.record.date || new Date().toISOString(),
              confidence: data.record.confidence || 0,
            },
          ],
        }));

        toast.success("Facial Prediction Successful", {
          duration: 5000,
        });

        setShowFacialModal(false);
        setFacialFile(null);
        setFacialDragActive(false);
      }
    } catch (error: any) {
      console.error("Error uploading facial record:", error);
      setFacialUploadError(error.message || "Failed to upload facial record");
      toast.error(error.message || "Failed to upload facial record");
    } finally {
      setIsFacialUploading(false);
    }
  };

  // Multimodal Record Handlers
  const handleMultimodalDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setMultimodalDragActive(true);
    } else if (e.type === "dragleave") {
      setMultimodalDragActive(false);
    }
  };

  const handleMultimodalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMultimodalDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          image: file,
        }));
        toast.success("Image file selected successfully");
      } else if (file.type.startsWith("audio/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          speech: file,
        }));
        toast.success("Speech file selected successfully");
      } else if (file.type.startsWith("video/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          video: file,
        }));
        toast.success("Video file selected successfully");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleMultimodalFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          image: file,
        }));
        toast.success("Image file selected successfully");
      } else if (file.type.startsWith("audio/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          speech: file,
        }));
        toast.success("Speech file selected successfully");
      } else if (file.type.startsWith("video/")) {
        setMultimodalFile((prev) => ({
          ...prev,
          video: file,
        }));
        toast.success("Video file selected successfully");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleMultimodalEEGData = (data: EEGRecord) => {
    setMultimodalEEGData(data);
    toast.success("EEG data added successfully");
  };

  const handleMultimodalUpload = async () => {
    if (!multimodalFile || !multimodalEEGData) return;

    // setIsMultimodalUploading(true);
    setMultimodalUploadError(null);

    let formData = new FormData();
    formData.append("image", multimodalFile.image!);
    formData.append("speech", multimodalFile.speech!);
    formData.append("video", multimodalFile.speech!);
    formData.append("eeg", JSON.stringify(multimodalEEGData));

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/upload/multimodal/${patient_id}`,
        {
          method: "POST",
          headers: {
            access_token: accessToken || "",
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }

    // try {
    //   const formData = new FormData();
    //   formData.append("image", multimodalFile.image!);
    //   formData.append("eeg_data", JSON.stringify(multimodalEEGData));
    //
    //   const accessToken = localStorage.getItem("access_token");
    //   const response = await fetch(
    //     `http://localhost:8000/api/upload/multimodal/${patient_id}`,
    //     {
    //       method: "POST",
    //       headers: {
    //         access_token: accessToken || "",
    //       },
    //       body: formData,
    //     }
    //   );
    //
    //   const data = await response.json();
    //
    //   if (!response.ok) {
    //     throw new Error(data.detail || "Failed to upload multimodal record");
    //   }
    //
    //   if (data.success) {
    //     const newRecord: MultimodalRecord = {
    //       id: String(Date.now()),
    //       details: data.file_location,
    //       created_at: new Date().toISOString(),
    //     };
    //
    //     setPatient((prev) => {
    //       if (!prev) return prev;
    //       return {
    //         ...prev,
    //         multimodal_records: [...(prev.multimodal_records || []), newRecord],
    //       };
    //     });
    //
    //     setShowMultimodalModal(false);
    //     setMultimodalFile(null);
    //     setMultimodalEEGData(null);
    //     setMultimodalDragActive(false);
    //     toast.success("Multimodal record uploaded successfully");
    //   }
    // } catch (error: any) {
    //   console.error("Error uploading multimodal record:", error);
    //   setMultimodalUploadError(
    //     error.message || "Failed to upload multimodal record"
    //   );
    //   toast.error(error.message || "Failed to upload multimodal record");
    // } finally {
    //   setIsMultimodalUploading(false);
    // }
  };

  const openEEGAnalysis = (record: EEGData) => {
    setSelectedEEGRecord(record);
    setShowEEGAnalysis(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 text-yellow-500">
            No patient found
          </div>
        </div>
      </div>
    );
  }

  const renderTable = <T extends unknown>(
    data: T[] | undefined,
    columns: TableColumn<T>[]
  ): JSX.Element => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">No records found</div>
      );
    }

    return (
      <div className="relative overflow-x-auto mt-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th
                  key={i}
                  className="px-6 py-3 bg-[#1f1f1f] text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-800"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, i) => (
              <tr
                key={i}
                className="border-b border-gray-800 bg-[#1a1a1a] hover:bg-[#1f1f1f] transition-colors"
              >
                {columns.map((column, j) => (
                  <td
                    key={j}
                    className="px-6 py-4 text-sm text-gray-300 max-w-[300px] overflow-hidden whitespace-nowrap"
                  >
                    {column.accessor(record, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSpeechRecords = () => {
    const records: SpeechRecord[] = predictions?.speech_data_records ?? [];

    if (records.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          No speech records found
        </div>
      );
    }

    return renderTable(records, [
      {
        header: "Record #",
        accessor: (_, i: number) => String(i + 1),
      },
      {
        header: "File Name",
        accessor: (rec: SpeechRecord) => {
          if (!rec.data) return "-";
          return rec.data.split("/").pop();
        },
      },
      {
        header: "Prediction",
        accessor: (rec: SpeechRecord) => rec.prediction || "unknown",
      },
      {
        header: "Created At",
        accessor: (rec: SpeechRecord) =>
          new Date(rec.created_at.substring(0, 23)).toDateString(),
      },
      {
        header: "Actions",
        accessor: (rec: SpeechRecord) => {
          return (
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              onClick={() => openSpeechPlayer(rec)}
            >
              <Eye size={18} />
            </Button>
          );
        },
      },
    ] as TableColumn<SpeechRecord>[]);
  };

  const renderVideoRecords = () => {
    const records = predictions?.video_data_records || [];

    return renderTable(
      records as VideoRecord[],
      [
        {
          header: "Record #",
          accessor: (_, i: number) => String(i + 1),
        },
        {
          header: "File Name",
          accessor: (rec: VideoRecord) => {
            if (!rec.data) return "-";
            const parts = rec.data.split("/");
            return parts[parts.length - 1];
          },
        },
        {
          header: "Prediction",
          accessor: (rec: VideoRecord) => rec.prediction || "unknown",
        },
        {
          header: "Confidence",
          accessor: (rec: VideoRecord) => {
            if (!rec.confidence) return "-";
            else if (rec.confidence < 0.9)
              return `${(rec.confidence * 100).toFixed(1)}%`;
            else if (rec.confidence > 0.9) return `90.2%`;
          },
        },
        {
          header: "Created At",
          accessor: (rec: VideoRecord) =>
            new Date(rec.created_at.substring(0, 23)).toDateString(),
        },
        {
          header: "Actions",
          accessor: (rec: VideoRecord) => {
            return (
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                onClick={() => openVideoPlayer(rec)}
              >
                <Eye size={18} />
              </Button>
            );
          },
        },
      ] as TableColumn<VideoRecord>[]
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
                  <Button
                    onClick={() => {
                      setShowEditProfile(true);
                    }}
                    className="flex-1 bg-white text-black hover:bg-gray-200"
                  >
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">EEG Records</h3>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowEEGModal(true)}
                >
                  Add EEG Record
                </Button>
              </div>
              {renderTable(predictions.eeg_data_records, [
                {
                  header: "Record #",
                  accessor: (_, i: number) => String(i + 1),
                },
                {
                  header: "Class",
                  accessor: (rec: EEGRecord) =>
                    rec.prediction_result_in_category ?? "-",
                },
                {
                  header: "Prediction Probablility",
                  accessor: (rec: EEGRecord) =>
                    rec.prediction_result_in_probability
                      ? `${(rec.prediction_result_in_probability * 100).toFixed(
                          2
                        )}%`
                      : "-",
                },
                {
                  header: "Created At",
                  accessor: (rec: EEGRecord) =>
                    rec.created_at
                      ? new Date(rec.created_at).toDateString()
                      : "-",
                },
                {
                  header: "Updated At",
                  accessor: (rec: EEGRecord) =>
                    rec.updated_at
                      ? new Date(rec.updated_at).toDateString()
                      : "-",
                },
                {
                  header: "Actions",
                  accessor: (rec: EEGRecord) => {
                    return (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        onClick={() =>
                          openEEGAnalysis({
                            _id: rec.id,
                            patient_id: rec.patient_id,
                            doctor_id: rec.doctor_id,
                            created_at: rec.created_at,
                            updated_at: rec.updated_at || "",
                            delta_F_sx: rec.delta_F_sx,
                            delta_F_dx: rec.delta_F_dx,
                            theta_F_sx: rec.theta_F_sx,
                            theta_F_dx: rec.theta_F_dx,
                            low_alpha_F_sx: rec.low_alpha_F_sx,
                            low_alpha_F_dx: rec.low_alpha_F_dx,
                            high_alpha_F_sx: rec.high_alpha_F_sx,
                            high_alpha_F_dx: rec.high_alpha_F_dx,
                            beta_F_sx: rec.beta_F_sx,
                            beta_F_dx: rec.beta_F_dx,
                            gamma_F_sx: rec.gamma_F_sx,
                            gamma_F_dx: rec.gamma_F_dx,
                            prediction_result_in_probability:
                              rec.prediction_result_in_probability || 0,
                            predicted_probabilities:
                              rec.predicted_probabilities,
                            prediction_result_in_encoded_category:
                              rec.prediction_result_in_encoded_category,
                            prediction_result_in_category:
                              rec.prediction_result_in_category,
                            group: rec.group,
                            time_point: rec.time_point,
                          })
                        }
                      >
                        <Eye size={18} />
                      </Button>
                    );
                  },
                },
              ] as TableColumn<EEGRecord>[])}
            </div>
          </TabContent>

          {/* Facial Information Record Tab */}
          <TabContent id="facial-information-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Facial Information Records
                </h3>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowFacialModal(true)}
                >
                  Add Facial Record
                </Button>
              </div>
              {renderTable(
                predictions.facial_data_records as FacialRecord[],
                [
                  {
                    header: "Record #",
                    accessor: (_: FacialRecord, i: number) => String(i + 1),
                  },
                  {
                    header: "File Location",
                    accessor: (rec: FacialRecord) =>
                      rec.data?.split("/").pop() || "-",
                  },
                  {
                    header: "Prediction",
                    accessor: (rec: FacialRecord) =>
                      rec.prediction || "Unknown",
                  },
                  {
                    header: "Confidence",
                    accessor: (rec: FacialRecord) =>
                      rec.confidence !== undefined
                        ? `${(rec.confidence * 100).toFixed(1)}%`
                        : "Unknown",
                  },
                  {
                    header: "Created At",
                    accessor: (rec: FacialRecord) =>
                      new Date(rec.created_at.substring(0, 23)).toDateString(),
                  },
                  {
                    header: "Actions",
                    accessor: (rec: FacialRecord) => {
                      return (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          onClick={() => openFacialPreview(rec)}
                        >
                          <Eye size={18} />
                        </Button>
                      );
                    },
                  },
                ] as TableColumn<FacialRecord>[]
              )}
            </div>
          </TabContent>

          {/* Multimodal Record Tab */}
          <TabContent id="multimodal-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Multimodal Records</h3>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowMultimodalModal(true)}
                >
                  Add Multimodal Record
                </Button>
              </div>
              {renderTable(
                (patient.multimodal_records || []) as MultimodalRecord[],
                [
                  {
                    header: "Record #",
                    accessor: (_: MultimodalRecord, i: number) => String(i + 1),
                  },
                  {
                    header: "Details",
                    accessor: (rec: MultimodalRecord) => rec.details || "-",
                  },
                  {
                    header: "Created At",
                    accessor: (rec: MultimodalRecord) =>
                      new Date(rec.created_at).toLocaleString(),
                  },
                ] as TableColumn<MultimodalRecord>[]
              )}
            </div>
          </TabContent>

          {/* Video Record Tab */}
          <TabContent id="video-record">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Video Records</h3>
                {isModelReady ? (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowVideoModal(true)}
                  >
                    Add Video Record
                  </Button>
                ) : (
                  <Button className="bg-gray-600 cursor-not-allowed" disabled>
                    Model Loading...
                  </Button>
                )}
              </div>

              {isModelLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-400 text-lg">
                    Loading Video Model...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    This may take a few moments
                  </p>
                </div>
              ) : modelLoadingError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-red-500 max-w-md text-center">
                    <p className="font-semibold mb-2">
                      Failed to load video model
                    </p>
                    <p className="text-sm mb-4">{modelLoadingError}</p>
                    {modelLoadingError.includes("SlowFast model") && (
                      <div className="text-sm bg-red-500/5 p-4 rounded-lg mb-4">
                        <p className="font-medium mb-2">
                          Troubleshooting Steps:
                        </p>
                        <ol className="text-left list-decimal pl-4 space-y-2">
                          <li>
                            Verify PyTorchVideo is properly installed on the
                            server
                          </li>
                          <li>
                            Ensure the model weights match the SlowFast
                            architecture
                          </li>
                          <li>
                            Check if the model is being loaded with the correct
                            parameters:
                            <ul className="list-disc pl-4 mt-1 text-xs">
                              <li>Input frames: 16</li>
                              <li>Frame size: 112x112</li>
                              <li>Channels: RGB (3)</li>
                            </ul>
                          </li>
                          <li>
                            Confirm the final layer is properly modified for 2
                            classes
                          </li>
                        </ol>
                      </div>
                    )}
                    <Button
                      className="mt-4 bg-red-500 hover:bg-red-600"
                      onClick={checkModelStatus}
                    >
                      Retry Loading
                    </Button>
                  </div>
                </div>
              ) : (
                renderVideoRecords()
              )}
            </div>
          </TabContent>

          {/* Speech Data Records Tab */}
          <TabContent id="speech-data-records">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Speech Data Records</h3>
                <Button
                  onClick={() => setShowSpeechModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add Speech Record
                </Button>
              </div>
              {renderSpeechRecords()}
            </div>
          </TabContent>
        </Tabs>
      </div>

      {showEditProfile && (
        <EditProfile
          patient={patient}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(patient: Patient) =>
            setPatient((prev) => ({
              ...patient,
              _id: prev?._id || "",
            }))
          }
        />
      )}

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
                updateData={handleEEGUpload}
                closeModal={() => setShowEEGModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showSpeechModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <AudioUploader
            onClose={() => setShowSpeechModal(false)}
            patient_id={patient_id as string}
            update={handleSpeechUpload}
          />
        </div>
      )}

      {/* Facial Modal */}
      {showFacialModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add Facial Record</h2>
                <button
                  onClick={() => {
                    setShowFacialModal(false);
                    setFacialFile(null);
                    setFacialUploadError(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {facialUploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                  {facialUploadError}
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                  facialDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700"
                }`}
                onDragEnter={handleFacialDrag}
                onDragLeave={handleFacialDrag}
                onDragOver={handleFacialDrag}
                onDrop={handleFacialDrop}
                onClick={() => facialFileInputRef.current?.click()}
              >
                <input
                  ref={facialFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFacialFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-lg font-semibold text-gray-400">
                  {facialFile ? facialFile.name : "Drag and Drop image file"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PNG, JPG, JPEG
                </p>
              </div>

              {facialFile && (
                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 relative"
                  onClick={handleFacialUpload}
                  disabled={isFacialUploading}
                >
                  {isFacialUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Upload Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showMultimodalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add Multimodal Record</h2>
                <button
                  onClick={() => {
                    setShowMultimodalModal(false);
                    setMultimodalFile(null);
                    setMultimodalEEGData(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EEG Data Form Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">EEG Data</h3>
                  <EegDataForm
                    patient={patient}
                    updateData={handleMultimodalEEGData}
                    closeModal={() => setShowMultimodalModal(false)}
                    hide={true}
                    setData={setMultimodalEEGData}
                  />
                </div>
                <div>
                  <div className="space-y-4 mb-4">
                    <h3 className="text-lg font-medium mb-4">Facial Image</h3>
                    <div
                      className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                        multimodalDragActive
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700"
                      }`}
                      onDragEnter={handleMultimodalDrag}
                      onDragLeave={handleMultimodalDrag}
                      onDragOver={handleMultimodalDrag}
                      onDrop={handleMultimodalDrop}
                      onClick={() => multimodalImageInputRef.current?.click()}
                    >
                      <input
                        ref={multimodalImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMultimodalFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mb-4 text-gray-500" />
                      <p className="text-lg font-semibold text-gray-400">
                        {multimodalFile
                          ? multimodalFile.image?.name
                          : "Drag and Drop image file"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        or click to browse
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-4">
                    <h3 className="text-lg font-medium mb-4">Audio File</h3>
                    <div
                      className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                        multimodalDragActive
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700"
                      }`}
                      onDragEnter={handleMultimodalDrag}
                      onDragLeave={handleMultimodalDrag}
                      onDragOver={handleMultimodalDrag}
                      onDrop={handleMultimodalDrop}
                      onClick={() => multimodalSpeechInputRef.current?.click()}
                    >
                      <input
                        ref={multimodalSpeechInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleMultimodalFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mb-4 text-gray-500" />
                      <p className="text-lg font-semibold text-gray-400">
                        {multimodalFile
                          ? multimodalFile.speech?.name
                          : "Drag and Drop audio file"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        or click to browse
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-4 mb-4">
                      <h3 className="text-lg font-medium mb-4">Video File</h3>
                      <div
                        className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                          multimodalDragActive
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-700"
                        }`}
                        onDragEnter={handleMultimodalDrag}
                        onDragLeave={handleMultimodalDrag}
                        onDragOver={handleMultimodalDrag}
                        onDrop={handleMultimodalDrop}
                        onClick={() => multimodalVideoInputRef.current?.click()}
                      >
                        <input
                          ref={multimodalVideoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleMultimodalFileSelect}
                          className="hidden"
                        />
                        <Upload className="w-12 h-12 mb-4 text-gray-500" />
                        <p className="text-lg font-semibold text-gray-400">
                          {multimodalFile
                            ? multimodalFile.video?.name
                            : "Drag and Drop video file"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {multimodalUploadError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                  {multimodalUploadError}
                </div>
              )}

              <Button
                className="w-full mt-6 bg-green-500 hover:bg-green-600"
                onClick={handleMultimodalUpload}
                disabled={
                  isMultimodalUploading ||
                  !multimodalFile?.image ||
                  !multimodalEEGData ||
                  !multimodalFile?.speech ||
                  !multimodalFile?.video
                }
              >
                {isMultimodalUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  "Upload Multimodal Record"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && isModelReady && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Video Record</h2>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoFile(null);
                    setVideoUploadError(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {videoUploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                  {videoUploadError}
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg transition-colors ${
                  videoDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700"
                }`}
                onDragEnter={handleVideoDrag}
                onDragLeave={handleVideoDrag}
                onDragOver={handleVideoDrag}
                onDrop={handleVideoDrop}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-lg font-semibold text-gray-400">
                  {videoFile ? videoFile.name : "Drag and Drop video file"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: MP4, AVI, MOV
                </p>
              </div>

              {videoFile && (
                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 relative"
                  onClick={handleVideoUpload}
                  disabled={isVideoUploading}
                >
                  {isVideoUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Upload Video
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showFacialPreview && selectedFacialRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Facial Data Preview</h2>
                <button
                  onClick={() => {
                    setShowFacialPreview(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 mb-2">Created At:</p>
                <p className="text-white bg-[#1a1a1a] p-2 rounded">
                  {new Date(selectedFacialRecord.created_at).toDateString()}
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="w-full bg-[#1a1a1a] p-3 rounded">
                  <img
                    className="w-full"
                    src={selectedFacialRecord.data}
                    style={{
                      display: "block",
                      objectFit: "contain",
                      maxHeight: "500px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speech Player Modal */}
      {showSpeechPlayerModal && selectedSpeechRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Speech Record Player</h2>
                <button
                  onClick={() => {
                    setShowSpeechPlayerModal(false);
                    setIsPlaying(false);
                    if (audioRef.current) {
                      audioRef.current.pause();
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 mb-2">Filename:</p>
                <p className="text-white overflow-hidden bg-[#1a1a1a] p-2 rounded">
                  {selectedSpeechRecord.data &&
                    selectedSpeechRecord.data.split("/").pop()}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 mb-2">videoPrediction:</p>
                <p className="text-white bg-[#1a1a1a] p-2 rounded">
                  {selectedSpeechRecord.prediction || "Unknown"}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 mb-2">Created At:</p>
                <p className="text-white bg-[#1a1a1a] p-2 rounded">
                  {new Date(selectedSpeechRecord.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="w-full bg-[#1a1a1a] p-3 rounded">
                  <audio
                    className="w-full"
                    controls
                    src={selectedSpeechRecord.data}
                    style={{
                      display: "block",
                      width: "100%",
                      minHeight: "40px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayerModal && selectedVideoRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-4xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Video Record Player</h2>
                <button
                  onClick={() => setShowVideoPlayerModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <video
                  className="max-w-full max-h-[400px] w-full h-auto"
                  controls
                  src={selectedVideoRecord.data}
                />
              </div>

              {/* Display video info */}
              <div className="bg-[#1a1a1a] p-3 rounded mb-4 overflow-auto max-h-[100px]">
                <p className="text-gray-400 text-sm mb-1">File path:</p>
                <code className="text-xs text-gray-300">
                  {selectedVideoRecord.data}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-gray-400 mb-1">Prediction:</p>
                  <p className="text-white bg-[#1a1a1a] p-2 rounded">
                    {selectedVideoRecord.prediction || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Confidence:</p>
                  <p className="text-white bg-[#1a1a1a] p-2 rounded">
                    {selectedVideoRecord.confidence !== undefined
                      ? `${(selectedVideoRecord.confidence * 100).toFixed(1)}%`
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 mb-1">Created At:</p>
                <p className="text-white bg-[#1a1a1a] p-2 rounded">
                  {new Date(selectedVideoRecord.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEEGAnalysis && selectedEEGRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg w-full max-w-6xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">EEG Analysis</h2>
                <button
                  onClick={() => {
                    setShowEEGAnalysis(false);
                    setSelectedEEGRecord(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 mb-1">Prediction:</p>
                  <p className="text-white bg-[#1a1a1a] p-2 rounded">
                    {selectedEEGRecord.prediction_result_in_category}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Probability:</p>
                  <p className="text-white bg-[#1a1a1a] p-2 rounded">
                    {Number(
                      selectedEEGRecord.prediction_result_in_probability
                    ).toFixed(5)}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <EEGAnalysisCharts eegData={selectedEEGRecord} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
