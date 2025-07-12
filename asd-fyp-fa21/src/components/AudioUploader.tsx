"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LucideMic,
  LucideStopCircle,
  LucideUpload,
  LucideLoader,
  LucideX,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

type AudioUploaderProps = {
  onClose: () => void;
  patient_id: string;
  update: (data: any) => void;
};

const url = API_BASE_URL;

export default function AudioUploader({
  onClose,
  patient_id,
  update,
}: AudioUploaderProps) {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const input_ref = useRef<HTMLInputElement>(null);

  // Handle file upload from input
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunks.current = [];

    recorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      const file = new File([blob], "recording.webm", { type: "audio/webm" });
      setAudioFile(file);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  // Stop the audio recording
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  // Handle file upload to backend
  const handleSubmit = async () => {
    if (!audioFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const res = await fetch(`${url}/upload/speech/${patient_id}`, {
        method: "POST",
        headers: {
          access_token: localStorage.getItem("access_token") || "",
        },
        body: formData,
      });

      const result = await res.json();
      update(result.record);
      console.log("Upload success:", result);
      toast.success("Audio Prediction Successful");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Audio Prediction Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto rounded-2xl p-4 shadow-xl bg-background fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
      >
        <LucideX className="w-5 h-5" />
      </button>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">Audio Upload & Recorder</h2>
          <p className="text-sm text-muted-foreground">
            Upload or record an audio file
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            ref={input_ref}
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            className={cn("cursor-pointer")}
          />

          <div className="flex gap-2 justify-center">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                variant="default"
                className="gap-2"
              >
                <LucideMic className="w-4 h-4" /> Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="gap-2"
              >
                <LucideStopCircle className="w-4 h-4" /> Stop Recording
              </Button>
            )}
          </div>

          {audioURL && (
            <div className="mt-4">
              <audio
                ref={audioRef}
                controls
                src={audioURL}
                className="w-full rounded"
              />
              {audioFile && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  {audioFile.name}
                </p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="mt-4 w-full gap-2"
              >
                {uploading ? (
                  <>
                    <LucideLoader className="w-4 h-4 animate-spin" />{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <LucideUpload className="w-4 h-4" /> Upload to Server
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
