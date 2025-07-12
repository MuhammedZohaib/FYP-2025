"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subDays, parse, isSameDay } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
}

interface NewsWithTimestamp extends NewsItem {
  timestamp: Date;
}

// Generate a random time for a given date
function generateRandomTime(date: Date): Date {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes);
  return newDate;
}

// Format a Date object as HH:MM
function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// Safely parse a date string in "MMMM d, yyyy" format; fallback to current date on error
function safeParseDateString(dateString: string): Date {
  try {
    return parse(dateString, "MMMM d, yyyy", new Date());
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return new Date();
  }
}

const CACHE_KEY = "healthNewsCache";
const CACHE_DURATION = 20 * 60 * 60 * 1000; // 20 hours in milliseconds

export default function HealthNewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsWithTimestamps, setNewsWithTimestamps] = useState<
    NewsWithTimestamp[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        // Check local storage for cached news
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const cacheTime = parsedCache.timestamp;
          // If cache is still valid, use it
          if (new Date().getTime() - cacheTime < CACHE_DURATION) {
            setNewsItems(parsedCache.data);
            setLoading(false);
            return;
          }
        }

        // If no valid cache, fetch from the API
        const response = await fetch(`${API_BASE_URL}/latest-news`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }

        const data = await response.json();
        let newsArray: NewsItem[] = [];

        if (data.articles && Array.isArray(data.articles)) {
          newsArray = data.articles;
        } else if (Array.isArray(data)) {
          newsArray = data;
        } else {
          newsArray = Array.isArray(data) ? data : [data];
        }

        // Store the fetched news in local storage with the current timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: newsArray,
            timestamp: new Date().getTime(),
          })
        );
        setNewsItems(newsArray);
      } catch (error) {
        console.error("Error fetching health news:", error);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  useEffect(() => {
    if (newsItems.length > 0) {
      const itemsWithTimestamps: NewsWithTimestamp[] = newsItems.map(
        (item, index) => {
          let itemDate = safeParseDateString(item.date);
          const offset = index % 3;
          const adjustedDate = subDays(itemDate, offset);
          const timestamp = generateRandomTime(adjustedDate);
          return { ...item, timestamp };
        }
      );
      itemsWithTimestamps.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      setNewsWithTimestamps(itemsWithTimestamps);
    }
  }, [newsItems]);

  // Filter news items for the selected date (exact match)
  const filteredNews = newsWithTimestamps.filter((item) =>
    isSameDay(item.timestamp, selectedDate)
  );

  // Navigation functions
  const goToPreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= today) {
      setSelectedDate(nextDay);
    }
  };

  const canGoToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay <= today;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && newsWithTimestamps.length === 0) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  return (
    <div>
      {/* Date navigation header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-900 border-gray-700 hover:bg-gray-800 text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                // Only disable future dates
                disabled={(date) => date > today}
                initialFocus
                className="bg-gray-900 text-white"
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={!canGoToNextDay()}
            className={`text-gray-400 hover:text-white hover:bg-gray-800 ${
              !canGoToNextDay() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-sm text-gray-400">
          {filteredNews.length}{" "}
          {filteredNews.length === 1 ? "article" : "articles"}
        </div>
      </div>

      {/* News items */}
      {filteredNews.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No health news available for {format(selectedDate, "MMMM d, yyyy")}.
        </div>
      ) : (
        <div className="space-y-px">
          {filteredNews.map((item, index) => (
            <NewsCard key={index} newsItem={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ newsItem }: { newsItem: NewsItem & { timestamp: Date } }) {
  const { title, link, description, timestamp } = newsItem;
  const timeString = formatTime(timestamp);

  // Generate random engagement numbers for demo purposes
  const likes = Math.floor(Math.random() * 30) + 5;
  const comments = Math.floor(Math.random() * 20);

  return (
    <div className="group border-b border-gray-800">
      <div className="flex">
        {/* Time column */}
        <div className="w-14 flex-shrink-0 pt-4 text-gray-500 text-sm">
          {timeString}
        </div>

        {/* Content column */}
        <div className="flex-1 py-4">
          <h2 className="text-lg font-medium mb-1 group-hover:text-rose-400 transition-colors">
            <a href={link} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </h2>
          <p className="text-gray-400 text-sm mb-3">{description}</p>

          {/* Bottom row with metrics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs">
                <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px]">
                  H
                </span>
                <span className="text-white">Health</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 ml-2">
                <span className="inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>
                  {Math.floor(Math.random() * 5) + 1}.
                  {Math.floor(Math.random() * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pb-3 pr-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-full">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-white text-sm">{likes}</span>
            </div>
            {comments > 0 && (
              <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-full">
                <span className="text-white text-sm">{comments} comments</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <div className="h-10 w-48 bg-gray-800 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
      </div>
      <div className="space-y-px">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-gray-800 py-4">
            <div className="flex">
              <div className="w-14 flex-shrink-0">
                <div className="h-4 w-10 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
