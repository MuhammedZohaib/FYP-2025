"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Error Loading Research Papers
        </h2>
        <p className="text-gray-400 mb-6">
          We encountered a problem while loading the latest research papers.
          Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-md transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
