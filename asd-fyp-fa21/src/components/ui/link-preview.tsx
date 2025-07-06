"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  siteName: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const data = await response.json();
          setPreview(data);
        } else {
          console.error("Link preview failed:", response.status);
          setError(true);
        }
      } catch (err) {
        console.error("Link preview error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url && isValidUrl(url)) {
      fetchPreview();
    } else {
      setError(true);
      setLoading(false);
    }
  }, [url]);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading) {
    return (
      <Card className="mt-3 bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-3">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-2 bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !preview) {
    return (
      <div className="mt-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          {url.length > 50 ? `${url.substring(0, 50)}...` : url}
        </a>
      </div>
    );
  }

  return (
    <Card className="mt-3 bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-colors">
      <CardContent className="p-0">
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="flex gap-3 p-3">
            {preview.image ? (
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src={preview.image || "/placeholder.svg"}
                  alt={preview.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-200 line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
                {preview.title}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                {preview.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="w-3 h-3" />
                <span className="truncate">{preview.siteName}</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-blue-400 transition-colors" />
          </div>
        </a>
      </CardContent>
    </Card>
  );
}
