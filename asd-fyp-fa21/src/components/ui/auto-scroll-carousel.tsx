"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  content: string;
  author: string;
  role: string;
  company: string;
}

export function AutoScrollCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative overflow-hidden w-full">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="flex-shrink-0 w-full bg-gray-900/50 border-gray-800 p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col h-full">
              <p className="text-gray-300 mb-6 flex-grow text-lg">
                {testimonial.content}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 mr-4 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-xs text-blue-400">{testimonial.company}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-600"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
