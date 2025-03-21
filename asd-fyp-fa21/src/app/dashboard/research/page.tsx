import ResearchPapersList from "@/components/research-papers-list";
import { FileText } from "lucide-react";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-rose-400 font-medium">
              Latest Research
            </h1>
            <span className="text-gray-400 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-xs mr-1">
                <FileText className="w-3 h-3" />
              </span>
              ASD Studies
            </span>
          </div>
        </div>

        {/* Research Papers List */}
        <ResearchPapersList />
      </div>
    </div>
  );
}
