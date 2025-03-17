"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="h-8 w-1/3 mb-8" />

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-[400px] rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-16 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-gray-800 rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {[
                "Patient Name",
                "Guardian",
                "Gender",
                "Phone No.",
                "ASD Status",
                "Date of Birth",
              ].map((_, index) => (
                <th key={index} className="py-3 px-4">
                  <Skeleton className="h-4 w-full rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(10)
              .fill(0)
              .map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-800">
                  {Array(6)
                    .fill(0)
                    .map((_, cellIndex) => (
                      <td key={cellIndex} className="py-3 px-4">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4 border-t border-gray-800">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
