import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        <Skeleton className="h-8 w-40 bg-gray-800 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column skeleton */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <div className="flex flex-col items-center mb-6">
              <div className="w-full h-48 bg-[#0f0f0f] rounded-lg mb-4 flex items-center justify-center">
                <Skeleton className="h-32 w-32 rounded-full bg-gray-800" />
              </div>
              <Skeleton className="h-6 w-40 bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-32 bg-gray-800" />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-gray-400" />
                <span className="text-gray-400">Contact Information</span>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-5 bg-gray-800" />
                  <Skeleton className="h-5 w-48 bg-gray-800" />
                </div>
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-5 bg-gray-800" />
                  <Skeleton className="h-5 w-32 bg-gray-800" />
                </div>
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-5 bg-gray-800" />
                  <Skeleton className="h-5 w-40 bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 bg-gray-800" />
              <Skeleton className="h-10 w-10 bg-gray-800" />
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="space-y-6">
            {/* General Information skeleton */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-gray-400" />
                <span className="text-gray-400">General Information</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-20 bg-gray-800" />
                  <Skeleton className="h-5 w-40 bg-gray-800" />
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-20 bg-gray-800" />
                  <Skeleton className="h-5 w-32 bg-gray-800" />
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-24 bg-gray-800" />
                  <Skeleton className="h-5 w-24 bg-gray-800" />
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-20 bg-gray-800" />
                  <Skeleton className="h-5 w-16 bg-gray-800" />
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <Skeleton className="h-5 w-16 bg-gray-800" />
                  <Skeleton className="h-5 w-32 bg-gray-800" />
                </div>
              </div>
            </div>

            {/* Statistics skeleton */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-gray-400" />
                <span className="text-gray-400">Statistics</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 bg-gray-800 rounded-lg" />
                <Skeleton className="h-24 bg-gray-800 rounded-lg" />
                <Skeleton className="h-24 bg-gray-800 rounded-lg" />
                <Skeleton className="h-24 bg-gray-800 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
