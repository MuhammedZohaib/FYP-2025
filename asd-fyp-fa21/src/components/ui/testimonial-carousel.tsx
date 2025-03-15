"use client";

import { Card } from "@/components/ui/card";

interface Testimonial {
  content: string;
  author: string;
  role: string;
  company: string;
}

export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <div className="overflow-hidden w-full">
      <div className="flex w-[150%] animate-marqueeLeftToRight">
        {testimonials.map((t, idx) => (
          <SingleTestimonial key={idx} testimonial={t} />
        ))}

        {testimonials.map((t, idx) => (
          <SingleTestimonial key={idx + testimonials.length} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

function SingleTestimonial({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-[650px] flex-shrink-0 p-7">
      <Card className="bg-[radial-gradient(circle,#171717_0%,#151515_100%)] p-7 border-none shadow-none h-full text-center">
        <p className="text-left text-gray-300 mb-6 text-[14px] md:text-xl leading-relaxed">
          {testimonial.content}
        </p>
        <h4 className="text-left font-semibold text-white">
          {testimonial.author}
        </h4>
        <p className="text-left text-sm text-gray-400">{testimonial.role}</p>
        <p className="text-left text-xs text-blue-400">{testimonial.company}</p>
      </Card>
    </div>
  );
}
