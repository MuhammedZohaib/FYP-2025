"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/config";

const endpoint = API_BASE_URL;

interface Patient {
  _id: string;
  name: string;
  eeg_data_records: EEGRecord[];
}

interface EEGRecord {
  _id: string;
  group: number;
  time_point: number;
  prediction: string;
  prediction_result: number;
  created_at: string;
}

interface EegDataFormProps {
  patient: Patient;
  updateData: (data: any) => void;
  closeModal: () => void;
  hide?: boolean;
  setData?: (data: any) => void;
}

const EEGFieldsLeft = [
  { label: "Delta", name: "delta_F_sx" },
  { label: "Theta", name: "theta_F_sx" },
  { label: "Low Alpha", name: "low_alpha_F_sx" },
  { label: "High Alpha", name: "high_alpha_F_sx" },
  { label: "Beta", name: "beta_F_sx" },
  { label: "Gamma", name: "gamma_F_sx" },
];

const EEGFieldsRight = [
  { label: "Delta", name: "delta_F_dx" },
  { label: "Theta", name: "theta_F_dx" },
  { label: "Low Alpha", name: "low_alpha_F_dx" },
  { label: "High Alpha", name: "high_alpha_F_dx" },
  { label: "Beta", name: "beta_F_dx" },
  { label: "Gamma", name: "gamma_F_dx" },
];

export default function EegDataForm({
  patient,
  updateData,
  closeModal,
  hide,
  setData,
}: EegDataFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    patient_id: patient?._id || "",
    name: patient?.name || "",
    group: "",
    time_point: "",
    delta_F_sx: "",
    delta_F_dx: "",
    theta_F_sx: "",
    theta_F_dx: "",
    low_alpha_F_sx: "",
    low_alpha_F_dx: "",
    high_alpha_F_sx: "",
    high_alpha_F_dx: "",
    beta_F_sx: "",
    beta_F_dx: "",
    gamma_F_sx: "",
    gamma_F_dx: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Parse CSV file
      if (file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const csvData = event.target.result as string;
            parseCSV(csvData);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const parseCSV = (csvData: string) => {
    const lines = csvData.split("\n");
    if (lines.length > 1) {
      const headers = lines[0].split(",");
      const values = lines[1].split(",");

      const newFormData = { ...formData };

      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        if (trimmedHeader in newFormData && values[index]) {
          newFormData[trimmedHeader as keyof typeof newFormData] =
            values[index].trim();
        }
      });

      setFormData(newFormData);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string values to numbers
      const dataToSubmit = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (key !== "patient_id" && key !== "name") {
            const numValue = parseFloat(value);
            acc[key] = isNaN(numValue) ? value : numValue;
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );

      // In a real app, you would make an API call here
      console.log("Submitting data:", dataToSubmit);

      if (hide && setData) {
        setData(dataToSubmit);
      } else {
        const res = await fetch(`${endpoint}/upload/eeg/${patient._id}`, {
          method: "POST",
          headers: {
            access_token: localStorage.getItem("access_token") || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        });

        const json = await res.json();

        updateData(json.patient.eeg_data_records[0]);

        console.log(json);

        setLoading(false);
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting EEG data:", error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <Label className="text-gray-400 text-sm mb-2 block">
          Import EEG Data (CSV)
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            className="bg-[#121212] border-gray-700 text-white hover:bg-[#252525]"
          >
            <Upload size={16} className="mr-2" />
            {selectedFile ? selectedFile.name : "Choose CSV File"}
          </Button>
          {selectedFile && (
            <span className="text-green-500 text-sm">File selected</span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-400 text-sm">Patient ID</Label>
            <Input
              value={formData.patient_id}
              disabled
              className="bg-[#121212] border-gray-700 text-white opacity-70"
            />
          </div>

          <div>
            <Label className="text-gray-400 text-sm">Name</Label>
            <Input
              value={formData.name}
              disabled
              className="bg-[#121212] border-gray-700 text-white opacity-70"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="group" className="text-gray-400 text-sm">
              Group
            </Label>
            <Select
              value={formData.group}
              onValueChange={(value) => handleInputChange("group", value)}
            >
              <SelectTrigger className="bg-[#121212] border-gray-700 text-white">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-gray-700 text-white">
                <SelectItem value="0">No Family History with ASD</SelectItem>
                <SelectItem value="2">Family History with ASD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time_point" className="text-gray-400 text-sm">
              Age at the time of EEG recording
            </Label>
            <Select
              value={formData.time_point}
              onValueChange={(value) => handleInputChange("time_point", value)}
            >
              <SelectTrigger className="bg-[#121212] border-gray-700 text-white">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-gray-700 text-white">
                <SelectItem value="1">Less than a year old</SelectItem>
                <SelectItem value="2">Year old or older</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Cluster */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 text-center">
            Left Cluster
          </h3>
          <div className="space-y-4">
            {EEGFieldsLeft.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name} className="text-gray-400 text-sm">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  placeholder="Value"
                  value={formData[field.name as keyof typeof formData]}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  className="bg-[#121212] border-gray-700 text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Cluster */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 text-center">
            Right Cluster
          </h3>
          <div className="space-y-4">
            {EEGFieldsRight.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name} className="text-gray-400 text-sm">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  placeholder="Value"
                  value={formData[field.name as keyof typeof formData]}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  className="bg-[#121212] border-gray-700 text-white"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {!hide && (
        <div className="flex gap-3 justify-start">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Processing..." : "Predict & Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="bg-[#121212] border-gray-700 text-white hover:bg-[#252525]"
          >
            Cancel
          </Button>
        </div>
      )}

      {hide && <Button onClick={handleSubmit}>Update</Button>}
    </form>
  );
}
