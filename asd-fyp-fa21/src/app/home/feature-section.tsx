"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  CloudLightningIcon as LightningBolt,
  BarChart2,
  Bot,
  Shield,
  FileText,
} from "lucide-react";
import Image from "next/image";

export default function FeaturesSection() {
  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <BentoGrid className="max-w-6xl mx-auto">
        <BentoGridItem
          className="md:col-span-7"
          title="One-Click Assessment"
          description="Quickly upload facial or audio samples, and let our AI do the rest. Get insights with just a single click."
          header={
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex bg-zinc-900 rounded-xl overflow-hidden aspect-square">
                <Image
                  src="/Vector.svg"
                  alt="Lightning icon"
                  width={150}
                  height={150}
                  className="m-auto"
                />
              </div>
              <div className="flex align-items-center bg-zinc-900 rounded-xl overflow-hidden aspect-square">
                <Image
                  src="/Frame.svg"
                  alt="Chart icon"
                  width={150}
                  height={150}
                  className="m-auto"
                />
              </div>
              <div className="bg-zinc-900 rounded-xl overflow-hidden aspect-square">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Bot icon"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          }
        />

        <BentoGridItem
          className="md:col-span-3"
          title="Real-Time Results"
          description="Receive fast and reliable predictions powered by advanced AI models. No waiting—actionable data in seconds."
          header={
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Dashboard screenshot"
                width={400}
                height={300}
                className="object-cover"
              />
            </div>
          }
        />

        <BentoGridItem
          className="md:col-span-3"
          title="Secure Data Processing"
          description="Your privacy is our priority. All data is encrypted and processed securely in the cloud."
          header={
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Security graph"
                width={400}
                height={300}
                className="object-cover"
              />
            </div>
          }
          icon={<Shield className="h-4 w-4 text-zinc-400" />}
        />

        <BentoGridItem
          className="md:col-span-7"
          title="Customizable Reports"
          description="Access clear and detailed reports tailored for parents, educators, or healthcare professionals to make informed decisions."
          header={
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image
                src=""
                alt="Reports dashboard"
                width={400}
                height={300}
                className="object-cover"
              />
            </div>
          }
          icon={<FileText className="h-4 w-4 text-zinc-400" />}
        />
      </BentoGrid>
    </div>
  );
}
