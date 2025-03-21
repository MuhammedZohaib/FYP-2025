"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Download,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current
        ?.requestFullscreen()
        .catch((err) => console.error(`Error enabling fullscreen: ${err}`));
    } else {
      document.exitFullscreen();
    }
  };

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Download PDF
  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const filename =
        pdfUrl.split("/").pop() || `${title.replace(/\s+/g, "_")}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  // Page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    // No limit to next page
    setCurrentPage((prev) => prev + 1);
  };

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal container with fade-up animation */}
      <div
        ref={viewerRef}
        className="relative w-full max-w-6xl h-[90vh] bg-[#0c0c0c] border border-gray-700 rounded-lg overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#1c1c1c] border-b border-gray-700">
          {/* Title / Brand area */}
          <div className="flex items-center">
            <h2 className="text-white font-semibold text-sm sm:text-base text-center">
              {title}
            </h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Download className="h-5 w-5" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="relative flex-1 h-[85vh] overflow-hidden">
          <iframe
            src={`${pdfUrl}#page=${currentPage}&zoom=${scale * 100}`}
            className="w-full h-full border-none"
            title={title}
          />

          {/* Left arrow (Previous Page) */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousPage}
              className="bg-gray-800/70 text-white hover:bg-gray-700 rounded-full h-10 w-10 ml-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          {/* Right arrow (Next Page) */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              className="bg-gray-800/70 text-white hover:bg-gray-700 rounded-full h-10 w-10 mr-2"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Footer with zoom controls */}
        <div className="flex items-center justify-end p-2 bg-[#1c1c1c] border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-gray-300 text-sm">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
