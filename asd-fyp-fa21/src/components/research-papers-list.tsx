"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFViewer from "@/components/pdf-viewer";

interface Author {
  name: string;
}

interface ResearchPaper {
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  venue: string;
  url: string;
  pdf_url: string;
}

export default function ResearchPapersList() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPapers, setExpandedPapers] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedPdf, setSelectedPdf] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    async function fetchPapers() {
      const cacheKey = "researchPapersCache";
      const cached = localStorage.getItem(cacheKey);
      const now = new Date().getTime();
      const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (now - cachedData.timestamp < sixHours) {
            setPapers(cachedData.data.papers);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached data", e);
        }
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/latest-research"
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch research papers: ${response.status}`
          );
        }
        const data = await response.json();
        setPapers(data.papers);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: now, data })
        );
      } catch (error) {
        console.error("Error fetching research papers:", error);
        setError("Failed to load research papers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPapers();
  }, []);

  const toggleAbstract = (index: number) => {
    setExpandedPapers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const openPdf = (url: string, title: string) => {
    setSelectedPdf({ url, title });
  };

  const closePdf = () => {
    setSelectedPdf(null);
  };

  const downloadPdf = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      // Create a clean filename from the title
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download the PDF. Please try again later.");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && papers.length === 0) {
    return (
      <div className="text-red-400 text-center py-8 bg-gray-900/50 rounded-lg border border-gray-800">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Vertical timeline */}
        <div className="absolute left-[22px] top-0 bottom-0 w-0 border-l border-gray-700 h-full"></div>

        <div className="space-y-6">
          {papers.map((paper, index) => (
            <div key={index} className="relative">
              {/* Time indicator with dot */}
              <div className="w-11 left-[-20px] flex-shrink-0 pt-1 text-gray-500 text-sm relative">
                {paper.year}
                <div className="absolute left-[-7px] top-2 w-3 h-3 bg-gray-700 rounded-full transform -translate-x-1/2 z-20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </div>
              </div>

              {/* Paper content */}
              <div className="ml-10 bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                {/* Paper header */}
                <div className="p-4">
                  <h2 className="text-lg font-medium text-blue-400 mb-2">
                    {paper.title}
                  </h2>

                  {/* Authors and metadata */}
                  <div className="flex flex-wrap gap-y-2 text-sm text-gray-400 mb-3">
                    <div className="flex items-center mr-4">
                      <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>
                        {paper.authors.slice(0, 3).join(", ")}
                        {paper.authors.length > 3
                          ? ` +${paper.authors.length - 3} more`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center mr-4">
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{paper.year}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{paper.venue}</span>
                    </div>
                  </div>

                  {/* Abstract toggle */}
                  <button
                    onClick={() => toggleAbstract(index)}
                    className="flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-3"
                  >
                    {expandedPapers[index] ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide Abstract
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show Abstract
                      </>
                    )}
                  </button>

                  {/* Abstract */}
                  {expandedPapers[index] && (
                    <div className="text-sm text-gray-300 mb-4 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                      {paper.abstract}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                      onClick={() => window.open(paper.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>

                    {paper.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-rose-900/30 border-rose-800/50 hover:bg-rose-800/50 text-white"
                        onClick={() => openPdf(paper.pdf_url, paper.title)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Read Paper
                      </Button>
                    )}

                    {paper.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        onClick={() => downloadPdf(paper.pdf_url, paper.title)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewer
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
          onClose={closePdf}
        />
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="relative">
      {/* Vertical timeline */}
      <div className="absolute left-[22px] top-0 bottom-0 w-0 border-l border-gray-700 h-full"></div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <div className="w-11 flex-shrink-0 pt-1 text-gray-500 text-sm relative">
              <div className="h-4 w-8 bg-gray-800 rounded animate-pulse"></div>
              <div className="absolute left-7 top-2 w-3 h-3 bg-gray-700 rounded-full transform -translate-x-1/2 z-20"></div>
            </div>

            <div className="ml-10 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse mb-3"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-4 w-40 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-40 bg-gray-800 rounded animate-pulse mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 w-28 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-8 w-28 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
