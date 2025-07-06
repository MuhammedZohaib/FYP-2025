"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Search } from "lucide-react";

interface SearchResult {
  name: string;
  url: string;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 bg-gray-800/30 border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-medium text-gray-300">Related Sources</h4>
        </div>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="border-l-2 border-blue-500/30 pl-3">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-1">
                      {result.name}
                    </h5>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
