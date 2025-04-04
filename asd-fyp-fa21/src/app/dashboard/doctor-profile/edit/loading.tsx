import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="py-6 px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-8 w-40 bg-gray-800 mb-8" />

        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-1/4 bg-gray-800" />
        </div>

        {/* Form Skeleton */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="pt-4 flex justify-end gap-2">
              <Skeleton className="h-10 w-24 bg-gray-800" />
              <Skeleton className="h-10 w-24 bg-gray-800" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
