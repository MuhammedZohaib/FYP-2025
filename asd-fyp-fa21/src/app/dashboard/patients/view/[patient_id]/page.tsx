"use client";

import { useState, useEffect, useRef, JSX, useCallback } from "react";
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
  Eye,
  Play,
  Pause,
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
import { useAuth } from "@/contexts/AuthContext";

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
  _id: string;
  patient_id: string;
  data: string;
  prediction: "HL-ASD" | "Typical";
  created_at: string;
  confidence?: number;
}

interface EEGRecord {
  id: string;
  data: string;
  prediction_result_in_category: string;
  created_at: string;
  prediction_result_in_probability?: number;
  updated_at?: string;
}

interface FacialRecord {
  id: string;
  info?: string;
  created_at: string;
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
}

interface TableColumn<T> {
  header: string;
  accessor: (item: T, index?: number) => string;
}

// Helper function to extract filename from path
const extractFilename = (path: string | undefined): string => {
  if (!path) {
    return "";
  }

  console.log("Extracting filename from path:", path);

  // Handle different path formats
  if (path.includes("uploads/speech/")) {
    return path.split("uploads/speech/").pop() || "";
  } else if (path.includes("uploads/video/")) {
    return path.split("uploads/video/").pop() || "";
  } else if (path.includes("/")) {
    return path.split("/").pop() || "";
  }

  // If no slashes, assume it's already just the filename
  return path;
};

// Video Player Component with improved format compatibility
const VideoPlayer = React.memo(
  ({
    src,
    poster,
    onError,
  }: {
    src: string;
    poster?: string;
    onError?: (error: string) => void;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const getVideoUrl = (videoPath: string) => {
      // If the path is already a full URL, append the token
      if (videoPath.startsWith("http")) {
        const url = new URL(videoPath);
        if (token) {
          url.searchParams.append("token", token);
        }
        return url.toString();
      }

      // Otherwise, construct the URL with the API endpoint
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = new URL(`${baseUrl}/api/files/${videoPath}`);

      if (token) {
        url.searchParams.append("token", token);
      }

      // Add the access_token as a query parameter
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        url.searchParams.append("access_token", accessToken);
      }

      console.log("Generated video URL:", url.toString());
      return url.toString();
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const videoElement = e.currentTarget;
      const errorMessage = videoElement.error
        ? `Video error: ${videoElement.error.message} (code: ${videoElement.error.code})`
        : "Unknown video playback error";

      console.error("Video playback error:", {
        error: videoElement.error,
        src: videoElement.src,
        readyState: videoElement.readyState,
      });

      setError(errorMessage);
      setLoading(false);

      if (onError) {
        onError(errorMessage);
      }
    };

    const handleLoadedData = () => {
      setLoading(false);
      setError(null);
    };

    useEffect(() => {
      // Reset states when source changes
      setLoading(true);
      setError(null);
    }, [src]);

    return (
      <div className="video-player-container relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="text-red-500 text-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
            <div className="text-sm text-gray-500">Source: {src}</div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          src={getVideoUrl(src)}
          poster={poster}
          onLoadedData={handleLoadedData}
          onError={handleError}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

// Audio Player Component with fallbacks
const AudioPlayer = React.memo(
  ({ src, onError }: { src: string; onError?: (error: string) => void }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const getAudioUrl = (audioPath: string) => {
      // If the path is already a full URL, append the token
      if (audioPath.startsWith("http")) {
        const url = new URL(audioPath);
        if (token) {
          url.searchParams.append("token", token);
        }
        return url.toString();
      }

      // Otherwise, construct the URL with the API endpoint
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Add access_token as a query parameter for authentication
      const accessToken = localStorage.getItem("access_token");

      // Ensure we're using the API path format /api/files/...
      const apiPath = `files/${audioPath}`;

      const url = new URL(`${baseUrl}/api/${apiPath}`);
      if (token) {
        url.searchParams.append("token", token);
      }
      if (accessToken) {
        url.searchParams.append("access_token", accessToken);
      }

      console.log("Generated audio URL:", url.toString());
      return url.toString();
    };

    const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const audioElement = e.currentTarget;
      const errorMessage = audioElement.error
        ? `Audio error: ${audioElement.error.message} (code: ${audioElement.error.code})`
        : "Unknown audio playback error";

      console.error("Audio playback error:", {
        error: audioElement.error,
        src: audioElement.src,
        readyState: audioElement.readyState,
      });

      setError(errorMessage);
      setLoading(false);

      if (onError) {
        onError(errorMessage);
      }
    };

    const handleLoadedData = () => {
      setLoading(false);
      setError(null);
    };

    useEffect(() => {
      // Reset states when source changes
      setLoading(true);
      setError(null);
    }, [src]);

    return (
      <div className="audio-player-container relative">
        {loading && (
          <div className="flex items-center justify-center h-16 bg-gray-100 bg-opacity-50 rounded">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded">
            <div className="text-red-500 text-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
            <div className="text-sm text-gray-500">Source: {src}</div>
          </div>
        )}

        {!error && (
          <audio
            ref={audioRef}
            className="w-full"
            controls
            src={getAudioUrl(src)}
            onLoadedData={handleLoadedData}
            onError={handleError}
            style={{ display: "block", width: "100%", minHeight: "40px" }}
          />
        )}
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";

export default function PatientInfo() {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<Predictions>({
    eeg_data_records: [],
    speech_data_records: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-information");
  const [error, setError] = useState<string | null>(null);

  const [showEEGModal, setShowEEGModal] = useState(false);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const router = useRouter();

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

        console.log("Video predictions:", videoPredictions);

        // Format video records for the state
        const formattedVideoRecords = videoPredictions.map((record: any) => ({
          id: record.id || String(Date.now()),
          data: record.data || "",
          prediction: record.prediction || "unknown",
          created_at: record.created_at || new Date().toISOString(),
          confidence: record.confidence || 0,
        }));

        // Update patient state with video records
        setPatient((prevPatient) => {
          if (!prevPatient) return prevPatient;
          return {
            ...prevPatient,
            video_records: formattedVideoRecords,
          };
        });

        setPredictions({
          eeg_data_records: eegPredictions.map((record: any) => ({
            id: record.id || String(Date.now()),
            data: record.data || "",
            prediction_result_in_category:
              record.prediction_result_in_category || "",
            created_at: record.created_at || new Date().toISOString(),
            prediction_result_in_probability:
              record.prediction_result_in_probability || 0,
            updated_at: record.updated_at || "",
          })),
          speech_data_records: speechPredictions.map((record: any) => ({
            id: record.id || String(Date.now()),
            data: record.data || "",
            prediction: record.prediction || "unknown",
            created_at: record.created_at || new Date().toISOString(),
            confidence: record.confidence || 0,
          })),
        });
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setPredictions({
          eeg_data_records: [],
          speech_data_records: [],
        });
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

      if (data.success) {
        const newRecord: SpeechRecord = {
          _id: String(Date.now()),
          data: data.file_location,
          prediction: data.prediction || "unknown",
          created_at: new Date().toISOString(),
          confidence: data.confidence || 0,
          patient_id: patient_id
            ? typeof patient_id === "string"
              ? patient_id
              : patient_id[0]
            : "",
        };

        console.log("Created new speech record:", newRecord);

        setPredictions((prev) => ({
          ...prev,
          speech_data_records: [...(prev.speech_data_records || []), newRecord],
        }));

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
        const newRecord: VideoRecord = {
          id: String(Date.now()),
          data: data.file_location,
          prediction: data.prediction,
          created_at: new Date().toISOString(),
          confidence: data.confidence,
        };

        // Update patient's video records
        setPatient((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            video_records: [...(prev.video_records || []), newRecord],
          };
        });

        setShowVideoModal(false);
        setVideoFile(null);
        setVideoDragActive(false);
        toast.success(data.detail || "Video record uploaded successfully");

        // Show prediction toast with confidence
        const confidencePercent =
          data.confidence !== undefined
            ? (data.confidence * 100).toFixed(1)
            : "N/A";

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

  // Toggle play/pause for audio
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Open speech player modal
  const openSpeechPlayer = (record: SpeechRecord) => {
    setSelectedSpeechRecord(record);
    setShowSpeechPlayerModal(true);
    setIsPlaying(false);
    console.log("Opening speech player for record:", record);
  };

  // Open video player modal
  const openVideoPlayer = (record: VideoRecord) => {
    setSelectedVideoRecord(record);
    setShowVideoPlayerModal(true);
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
                    className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap"
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
          const parts = rec.data.split("/");
          const fileName = parts[parts.length - 1]
            .split("_")[1]
            .concat(parts[parts.length - 1].split("_")[2]);
          return fileName;
        },
      },
      {
        header: "Prediction",
        accessor: (rec: SpeechRecord) => rec.prediction || "unknown",
      },
      {
        header: "Created At",
        accessor: (rec: SpeechRecord) =>
          new Date(rec.created_at).toDateString(),
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
    const records = patient?.video_records || [];

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
          accessor: (rec: VideoRecord) =>
            rec.confidence !== undefined
              ? `${(rec.confidence * 100).toFixed(1)}%`
              : "-",
        },
        {
          header: "Created At",
          accessor: (rec: VideoRecord) =>
            new Date(rec.created_at).toLocaleString(),
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

  const openSpeechModal = (record: SpeechRecord) => {
    setSelectedSpeechRecord(record);
    setShowSpeechModal(true);
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
                    Number(rec.prediction_result_in_probability).toFixed(5) ||
                    "-",
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
                patient.facial_data_records as FacialRecord[],
                [
                  {
                    header: "Record #",
                    accessor: (_: FacialRecord, i: number) => String(i + 1),
                  },
                  {
                    header: "Info",
                    accessor: (rec: FacialRecord) => rec.info || "-",
                  },
                  {
                    header: "Created At",
                    accessor: (rec: FacialRecord) =>
                      new Date(rec.created_at).toLocaleString(),
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
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Add Speech Record
                </Button>
              </div>
              {renderSpeechRecords()}
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
                updateData={handleEEGUpload}
                closeModal={() => setShowEEGModal(() => false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Speech Modal */}
      {showSpeechModal && selectedSpeechRecord && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Speech Record Details</h3>
              <Button
                onClick={() => {
                  setShowSpeechModal(false);
                  setSelectedSpeechRecord(null);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={24} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Created At</h4>
                <p>
                  {new Date(selectedSpeechRecord.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Prediction</h4>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSpeechRecord.prediction === "HL-ASD"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedSpeechRecord.prediction}
                  </span>
                  {selectedSpeechRecord.confidence !== undefined && (
                    <span className="ml-3 text-gray-500">
                      Confidence:{" "}
                      {(selectedSpeechRecord.confidence * 100).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Audio</h4>
                <div className="bg-gray-100 p-3 rounded">
                  <AudioPlayer
                    src={selectedSpeechRecord.data}
                    onError={(errorMsg) =>
                      console.error("Speech audio error:", errorMsg)
                    }
                  />
                </div>
              </div>
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
              <div className="mt-4">
                {/* Add your facial record form here */}
                <p className="text-gray-400">
                  Facial record form implementation coming soon...
                </p>
              </div>
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
              <div className="mt-4">
                {/* Add your multimodal record form here */}
                <p className="text-gray-400">
                  Multimodal record form implementation coming soon...
                </p>
              </div>
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
                <p className="text-white bg-[#1a1a1a] p-2 rounded">
                  {selectedSpeechRecord.data &&
                    selectedSpeechRecord.data.split("/").pop()}
                </p>
              </div>

              {/* Display audio path */}
              <div className="bg-[#1a1a1a] p-3 rounded mb-4 overflow-auto max-h-[100px]">
                <p className="text-gray-400 text-sm mb-1">File path:</p>
                <code className="text-xs text-gray-300">
                  {selectedSpeechRecord.data}
                </code>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 mb-2">Prediction:</p>
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
                  <AudioPlayer
                    src={selectedSpeechRecord.data}
                    onError={() => {}}
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
                <VideoPlayer
                  src={selectedVideoRecord.data}
                  poster={selectedVideoRecord.data}
                  onError={() => {}}
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
    </div>
  );
}
