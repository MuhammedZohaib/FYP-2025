"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Image from "next/image";

export default function FeaturesSection() {
  return (
    <div className="bg-black text-white py-20">
      <BentoGrid className="max-w-7xl mx-auto px-6">
        <BentoGridItem
          className="md:col-span-7"
          title="One-Click Assessment"
          description="Quickly upload facial or audio samples, and let our AI do the rest. Get insights with just a single click."
          header={
            <div className="grid grid-cols-3 gap-4">
              {["/Vector.svg", "/Frame.svg", "/bot.svg"].map((src, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center bg-zinc-900 rounded-xl aspect-square p-8"
                >
                  <Image
                    src={src}
                    alt={`Icon ${index + 1}`}
                    width={120}
                    height={120}
                    className="flex align-items-center m-auto"
                  />
                </div>
              ))}
            </div>
          }
        />

        <BentoGridItem
          className="md:col-span-3"
          title="Real-Time Results"
          description="Receive fast and reliable predictions powered by advanced AI models. No waiting—actionable data in seconds."
          header={
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-zinc-900">
              <Image
                src="/assest-1.svg"
                alt="Dashboard screenshot"
                fill
                className="object-cover"
              />
            </div>
          }
        />

        <BentoGridItem
          className="grid place-items-center md:col-span-3"
          title="Secure Data Processing"
          description="Your privacy is our priority. We employ robust encryption protocols to ensure that your data remains confidential and secure during transmission and storage. By processing all data securely in the cloud, we safeguard your information against unauthorized access and potential breaches. "
          header={
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-zinc-900">
              <Image
                src="/secure.svg"
                alt="Security graph"
                fill
                className="object-cover"
              />
            </div>
          }
        />

        <BentoGridItem
          className="md:col-span-7"
          title="Customizable Reports"
          description="Access clear and detailed reports tailored for parents, educators, or healthcare professionals to make informed decisions."
          header={
            <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden bg-zinc-900">
              <Image
                src="/image.jpg"
                alt="Reports dashboard"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          }
        />
      </BentoGrid>
    </div>
  );
}
